"""Real-tenant seed for "Prince Corner" (Isanpur, Ahmedabad) — a genuine,
already-operating restaurant being provisioned as the flagship proof-of-
concept tenant on this platform (QR scan -> order -> kitchen screen -> admin
dashboard -> platform view), not throwaway demo data. Every fact below (cost
for two, hours, cuisines, address detail) is taken from Prince Corner's real
MagicPin listing; tone/signature lines and photo choices are cross-checked
against the existing marketing pages `frontend/src/app/prince-corner/` and
`frontend/src/app/prince-corner-experience/data.ts`.

Idempotent — safe to call `seed()` any number of times without duplicating
rows or hitting unique-constraint errors, same style as every other module in
this package. Only ever touches `Organization.slug == "prince-corner"` and
its 4 real branches (Isanpur, Maninagar, Vastrapur, Satellite — matching the
locations already named on the original `/prince-corner` marketing page) plus
their users/menu/tables — never `Organization.slug == "default-org"` /
`Restaurant.slug == "default"` (the real user's own "kelviontech" restaurant)
or any of the other seeded demo orgs (Demo Bistro Group, Trial Bites Co,
Closed Kitchen Group).

Run with (from backend/, venv active):
    python -m app.seed_demo_data.prince_corner
"""

import asyncio
import re
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.base import new_uuid
from app.db.session import AsyncSessionLocal
from app.models.menu import MenuCategory, MenuItem, MenuItemAddon, MenuItemVariant
from app.models.organization import Organization, OrganizationPlanEnum, OrganizationStatusEnum
from app.models.restaurant import Restaurant
from app.models.site_settings import SiteSettings
from app.models.table import RestaurantTable
from app.models.user import RoleEnum, User
from app.schemas.organization import BranchCreate
from app.services.organization import create_branch

ORG_NAME = "Prince Corner"
ORG_SLUG = "prince-corner"

# 4 real, currently-operating locations — matching the areas/names already
# published on the original `/prince-corner` marketing page (PrinceBranchWheel)
# so nothing here is invented, just provisioned to match what's already live.
# "Bopal" from that same page stays marketing-only ("coming soon") — not
# seeded as a real orderable branch.
BRANCH_SPECS = [
    {
        "area_key": "isanpur",
        "slug": "prince-corner-isanpur",
        "name": "Prince Corner - Isanpur",
        "area": "Isanpur",
        "street": "Near Rameshwar Shopping Center, Vatva Road",
    },
    {
        "area_key": "maninagar",
        "slug": "prince-corner-maninagar",
        "name": "Prince Corner - Maninagar",
        "area": "Maninagar",
        "street": "Maninagar Char Rasta, Rambaug Road",
    },
    {
        "area_key": "vastrapur",
        "slug": "prince-corner-vastrapur",
        "name": "Prince Corner - Vastrapur",
        "area": "Vastrapur",
        "street": "Vastrapur Lake Road",
    },
    {
        "area_key": "satellite",
        "slug": "prince-corner-satellite",
        "name": "Prince Corner - Satellite",
        "area": "Satellite",
        "street": "Satellite Road, near Jodhpur Cross Road",
    },
]

# Matches the palette already established for the marketing pages —
# `frontend/src/app/prince-corner/PrinceHero.tsx` (red overlay `#b71c1c`) and
# `frontend/src/app/prince-corner-experience/data.ts` (gold accent `#D4AF37`).
BRAND_LOGO_URL = "/princelogo.png"
BRAND_PRIMARY_COLOR = "#b71c1c"
BRAND_ACCENT_COLOR = "#D4AF37"

OWNER_EMAIL = "owner@princecorner.example.com"  # single org-wide super_admin
DEFAULT_PASSWORD = "PrinceCorner@123"  # nosec - dev-only default, rotate before any real handoff


def _branch_staff_email(role_slug: str, area_key: str) -> str:
    """Isanpur keeps its original bare emails (manager@.../kitchen@.../
    cashier@...) unchanged for backward compatibility with what was already
    seeded and reported; every other branch gets a `.{area}` suffix so each
    branch's staff logins are distinct."""
    if area_key == "isanpur":
        return f"{role_slug}@princecorner.example.com"
    return f"{role_slug}.{area_key}@princecorner.example.com"

TABLE_CODES = [f"T{i}" for i in range(1, 9)]  # T1..T8 — real dine-in QR tables
ONLINE_TABLE_CODE = "ONLINE"  # anchor row for the "Order Online" flow

CATEGORY_NAMES = ["Punjabi", "South Indian", "Chinese", "Street Food", "Beverages & Desserts"]

# key -> item spec. photo_url pulled from this repo's own real Prince Corner
# photo set (frontend/public/food-photos, frontend/public/menu-photos) —
# spread across both folders rather than reusing a single image.
MENU_ITEMS: list[dict] = [
    # -- Punjabi --
    {
        "key": "butter-paneer-masala",
        "category": "Punjabi",
        "name": "Butter Paneer Masala",
        "description": "Soft paneer cubes simmered in a velvety tomato-butter gravy, finished with cream.",
        "price": "220",
        "photo": ("/food-photos/food_01.jpg", "Butter paneer masala in rich tomato gravy"),
    },
    {
        "key": "dal-makhani",
        "category": "Punjabi",
        "name": "Dal Makhani",
        "description": "Black lentils and kidney beans, slow-simmered overnight with butter and cream.",
        "price": "180",
        "photo": ("/menu-photos/menu_01.jpg", "Creamy dal makhani in a copper handi"),
    },
    {
        "key": "paneer-tikka-masala",
        "category": "Punjabi",
        "name": "Paneer Tikka Masala",
        "description": "Char-grilled paneer tikka tossed into a smoky onion-tomato masala.",
        "price": "210",
        "photo": ("/menu-photos/menu_02.jpg", "Paneer tikka masala garnished with coriander"),
    },
    {
        "key": "amritsari-kulcha",
        "category": "Punjabi",
        "name": "Amritsari Kulcha",
        "description": "Stuffed tandoor-baked kulcha with spiced potato filling, served with chole and pickle.",
        "price": "90",
        "photo": ("/food-photos/food_02.jpg", "Amritsari kulcha served with chole"),
    },
    {
        "key": "lachha-paratha",
        "category": "Punjabi",
        "name": "Lachha Paratha",
        "description": "Multi-layered, flaky tandoor paratha brushed with ghee.",
        "price": "45",
        "photo": ("/menu-photos/menu_03.jpg", "Flaky lachha paratha stack"),
    },
    {
        "key": "prince-punjabi-thali",
        "category": "Punjabi",
        "name": "Prince Punjabi Thali",
        "description": "Our signature spread — dal, paneer sabzi, seasonal veg, rice, roti, salad and dessert.",
        "price": "250",
        "photo": ("/food-photos/food_03.jpg", "Prince Corner's full Punjabi thali platter"),
    },
    # -- South Indian --
    {
        "key": "masala-dosa",
        "category": "South Indian",
        "name": "Golden Masala Dosa",
        "description": "Paper-thin, flawlessly crisp dosa, served with piping-hot sambar and coconut chutney.",
        "price": "110",
        "photo": ("/food-photos/food_05.jpg", "Golden crisp masala dosa with sambar and chutney"),
    },
    {
        "key": "idli-sambar",
        "category": "South Indian",
        "name": "Idli Sambar",
        "description": "Steamed rice cakes served with hot sambar and fresh coconut chutney.",
        "price": "80",
        "photo": ("/menu-photos/menu_04.jpg", "Soft idlis with sambar and chutney"),
    },
    {
        "key": "uttapam",
        "category": "South Indian",
        "name": "Onion Tomato Uttapam",
        "description": "Thick savoury rice pancake loaded with onion, tomato and green chilli.",
        "price": "120",
        "photo": ("/food-photos/food_06.jpg", "Onion tomato uttapam on a banana leaf"),
    },
    {
        "key": "medu-vada",
        "category": "South Indian",
        "name": "Medu Vada",
        "description": "Crisp-fried lentil doughnuts, soft on the inside, served with sambar and chutney.",
        "price": "70",
        "photo": ("/menu-photos/menu_05.jpg", "Crispy medu vada plated with sambar"),
    },
    {
        "key": "rava-dosa",
        "category": "South Indian",
        "name": "Rava Dosa",
        "description": "Lacy, crisp semolina dosa with a mildly spiced onion-cumin topping.",
        "price": "130",
        "photo": ("/food-photos/food_07.jpg", "Crisp lacy rava dosa"),
    },
    # -- Chinese --
    {
        "key": "veg-manchurian",
        "category": "Chinese",
        "name": "Veg Manchurian",
        "description": "Crisp vegetable dumplings tossed in a tangy garlic-soy Manchurian sauce.",
        "price": "160",
        "photo": ("/menu-photos/menu_06.jpg", "Veg Manchurian in tangy sauce with spring onion"),
    },
    {
        "key": "hakka-noodles",
        "category": "Chinese",
        "name": "Hakka Noodles",
        "description": "Wok-tossed noodles with julienned vegetables in a light soy-garlic glaze.",
        "price": "140",
        "photo": ("/food-photos/food_08.jpg", "Wok-tossed hakka noodles with vegetables"),
    },
    {
        "key": "chilli-paneer",
        "category": "Chinese",
        "name": "Wok-Tossed Chilli Paneer",
        "description": "Fiery, tangy paneer tossed with peppers and onion — packed with street-style heat.",
        "price": "180",
        "photo": ("/food-photos/food_09.jpg", "Wok-tossed chilli paneer with bell peppers"),
    },
    {
        "key": "schezwan-fried-rice",
        "category": "Chinese",
        "name": "Schezwan Fried Rice",
        "description": "Wok-fried rice tossed in fiery schezwan sauce with crunchy vegetables.",
        "price": "150",
        "photo": ("/menu-photos/menu_07.jpg", "Schezwan fried rice with vegetables"),
    },
    {
        "key": "chilli-potato",
        "category": "Chinese",
        "name": "Crispy Chilli Potato",
        "description": "Golden fried potato fingers tossed in a spicy-sweet chilli-garlic glaze.",
        "price": "120",
        "photo": ("/food-photos/food_10.jpg", "Crispy chilli potato tossed in sauce"),
    },
    # -- Street Food --
    {
        "key": "pav-bhaji",
        "category": "Street Food",
        "name": "Prince Special Pav Bhaji",
        "description": "Slow-mashed on the tawa for hours, finished with a generous knob of melting butter.",
        "price": "120",
        "photo": ("/food-photos/food_11.jpg", "Prince Special pav bhaji with buttered pav"),
    },
    {
        "key": "vada-pav",
        "category": "Street Food",
        "name": "Vada Pav",
        "description": "Spiced potato fritter in a soft pav, served with garlic and green chutney.",
        "price": "40",
        "photo": ("/menu-photos/menu_08.jpg", "Classic vada pav with chutneys"),
    },
    {
        "key": "pani-puri",
        "category": "Street Food",
        "name": "Pani Puri",
        "description": "Crisp puris filled with spiced potato, tangy tamarind and mint water.",
        "price": "60",
        "photo": ("/food-photos/food_12.jpg", "Pani puri plate with mint water"),
    },
    {
        "key": "bhel-puri",
        "category": "Street Food",
        "name": "Bhel Puri",
        "description": "Puffed rice tossed with sev, onion, tomato and tangy tamarind chutney.",
        "price": "70",
        "photo": ("/menu-photos/menu_09.jpg", "Bhel puri tossed with sev and chutneys"),
    },
    # -- Beverages & Desserts --
    {
        "key": "royal-falooda",
        "category": "Beverages & Desserts",
        "name": "Royal Falooda",
        "description": "Layers of rose syrup, vermicelli, basil seeds and a scoop of kulfi.",
        "price": "150",
        "photo": ("/food-photos/food_16.jpg", "Royal falooda layered with kulfi and rose syrup"),
    },
    {
        "key": "masala-chaas",
        "category": "Beverages & Desserts",
        "name": "Masala Chaas",
        "description": "Chilled spiced buttermilk with roasted cumin and curry leaf.",
        "price": "60",
        "photo": ("/menu-photos/menu_16.jpg", "Chilled masala chaas in a glass"),
    },
    {
        "key": "cold-coffee",
        "category": "Beverages & Desserts",
        "name": "Cold Coffee",
        "description": "Chilled, whipped cold coffee topped with a dusting of cocoa.",
        "price": "90",
        "photo": ("/food-photos/food_14.jpg", "Frothy cold coffee glass"),
    },
    {
        "key": "fresh-lime-soda",
        "category": "Beverages & Desserts",
        "name": "Fresh Lime Soda",
        "description": "Sweet, salted or mixed — fresh lime juice topped with chilled soda.",
        "price": "60",
        "photo": ("/menu-photos/menu_10.jpg", "Fresh lime soda with mint garnish"),
    },
    {
        "key": "gulab-jamun",
        "category": "Beverages & Desserts",
        "name": "Gulab Jamun (2 pc)",
        "description": "Warm, soft milk-solid dumplings soaked in rose-cardamom sugar syrup.",
        "price": "80",
        "photo": ("/food-photos/food_15.jpg", "Warm gulab jamun in syrup"),
    },
]

# key -> [(variant name, price), ...]. Price is an absolute value, not a delta.
VARIANT_ITEMS: dict[str, list[tuple[str, str]]] = {
    "masala-dosa": [("Regular", "110"), ("Family Size", "280")],
    "prince-punjabi-thali": [("Regular", "250"), ("Family Size (2 pax)", "450")],
}

# key -> [(addon name, price), ...]
ADDON_ITEMS: dict[str, list[tuple[str, str]]] = {
    "masala-dosa": [("Extra Coconut Chutney", "15"), ("Extra Sambar", "20")],
    "chilli-paneer": [("Extra Cheese", "30")],
    "pav-bhaji": [("Extra Butter", "20"), ("Extra Pav", "20")],
}


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "category"


async def seed_org(db: AsyncSession) -> Organization:
    """Creates the "Prince Corner" Organization (pro plan, active status),
    idempotent by slug."""
    org_result = await db.execute(select(Organization).where(Organization.slug == ORG_SLUG))
    org = org_result.scalar_one_or_none()
    if not org:
        org = Organization(
            name=ORG_NAME,
            slug=ORG_SLUG,
            status=OrganizationStatusEnum.active,
            plan=OrganizationPlanEnum.pro,
        )
        db.add(org)
        await db.flush()
        print(f"Seeded: organization '{ORG_NAME}' ({ORG_SLUG}), status=active, plan=pro.")
    else:
        print(f"Organization '{ORG_SLUG}' already exists — nothing to do.")
    return org


async def seed_branch(db: AsyncSession, org: Organization, spec: dict) -> Restaurant:
    """Creates one branch from `spec`, idempotent by slug."""
    branch_result = await db.execute(select(Restaurant).where(Restaurant.slug == spec["slug"]))
    branch = branch_result.scalar_one_or_none()
    if not branch:
        branch = await create_branch(db, org.id, BranchCreate(name=spec["name"], slug=spec["slug"]))
        print(f"Seeded: branch '{spec['name']}' ({spec['slug']}).")
    else:
        print(f"Branch '{spec['slug']}' already exists — nothing to do.")
    return branch


async def seed_branding(db: AsyncSession) -> None:
    """Sets Organization.brand_* fields (logo + red/gold palette) if not
    already set."""
    org_result = await db.execute(select(Organization).where(Organization.slug == ORG_SLUG))
    org = org_result.scalar_one_or_none()
    if not org:
        print(f"Organization '{ORG_SLUG}' not found — skipping branding seed.")
        return

    if org.brand_logo_url or org.brand_primary_color or org.brand_accent_color:
        print("Prince Corner branding already set — nothing to do.")
        return

    org.brand_logo_url = BRAND_LOGO_URL
    org.brand_primary_color = BRAND_PRIMARY_COLOR
    org.brand_accent_color = BRAND_ACCENT_COLOR
    await db.commit()
    print(
        f"Seeded: Prince Corner branding (logo={BRAND_LOGO_URL}, primary={BRAND_PRIMARY_COLOR}, "
        f"accent={BRAND_ACCENT_COLOR})."
    )


async def seed_site_settings(db: AsyncSession, branch: Restaurant, spec: dict) -> None:
    """Fills in the SiteSettings row `create_branch` already created for this
    branch with Prince Corner's real identity/hours/contact details. Only
    overwrites fields when tagline is still empty, so re-running never
    clobbers any manual edits made in Admin > Settings after the first seed."""
    result = await db.execute(select(SiteSettings).where(SiteSettings.restaurant_id == branch.id))
    settings = result.scalar_one_or_none()
    if not settings:
        print(f"SiteSettings row for branch '{branch.slug}' not found — skipping (unexpected).")
        return

    if settings.tagline:
        print(f"'{branch.slug}' site settings already populated — nothing to do.")
        return

    settings.tagline = "Taste the Legacy — Open up your happiness!"
    settings.description = (
        f"Prince Corner {spec['area']} is home to Punjabi, South Indian, Chinese, Street Food and "
        "Fast Food — from butter-rich curries and crisp dosas to wok-tossed Chinese and tawa "
        "street food, all made fresh, every day."
    )
    settings.logo_url = BRAND_LOGO_URL
    settings.primary_color = BRAND_PRIMARY_COLOR
    settings.accent_color = BRAND_ACCENT_COLOR
    settings.address_street = spec["street"]
    settings.address_area = spec["area"]
    settings.address_city = "Ahmedabad"
    settings.maps_query = f"Prince Corner {spec['area']} Ahmedabad"
    settings.phone = "+91 98765 43210"
    settings.whatsapp = "919876543210"
    settings.whatsapp_greeting = f"Hi! I'd like to place an order at Prince Corner {spec['area']}."
    settings.email = "hello@princecorner.example.com"
    settings.hours = [{"days": "Monday – Sunday", "time": "11:00 AM – 11:00 PM"}]
    settings.timeslots = [
        "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
        "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
    ]
    settings.tax_rate = Decimal("5.00")
    await db.commit()
    print(f"Seeded: SiteSettings for branch '{branch.slug}' (tagline, hours, address, contact, tax_rate=5.00).")


async def seed_menu(db: AsyncSession, branch: Restaurant) -> tuple[int, int, int, int]:
    """Creates the 5 Prince Corner categories + full realistic menu (with a
    couple of variants and addons) for this branch. Skips entirely if the
    branch already has more than 1 category (already seeded). Returns
    (categories_added, items_added, variants_added, addons_added)."""
    result = await db.execute(select(MenuCategory).where(MenuCategory.restaurant_id == branch.id))
    existing_categories = list(result.scalars().all())
    if len(existing_categories) > 1:
        print(f"Branch '{branch.slug}' already has menu categories — skipping menu seed.")
        return (0, 0, 0, 0)

    category_by_name = {c.name.lower(): c for c in existing_categories}
    sort_order = len(existing_categories)
    categories_added = 0
    for name in CATEGORY_NAMES:
        if name.lower() in category_by_name:
            continue
        category = MenuCategory(restaurant_id=branch.id, name=name, slug=_slugify(name), sort_order=sort_order)
        db.add(category)
        await db.flush()
        category_by_name[name.lower()] = category
        sort_order += 1
        categories_added += 1

    items_added = 0
    variants_added = 0
    addons_added = 0
    for i, item in enumerate(MENU_ITEMS):
        category = category_by_name[item["category"].lower()]
        photo_src, photo_alt = item["photo"]
        menu_item = MenuItem(
            id=new_uuid(),
            restaurant_id=branch.id,
            category_id=category.id,
            name=item["name"],
            description=item["description"],
            base_price=Decimal(item["price"]),
            dietary_tags=["vegetarian"],
            photo_url=photo_src,
            photo_alt=photo_alt,
            sort_order=i,
        )
        db.add(menu_item)
        await db.flush()
        items_added += 1

        for j, (variant_name, variant_price) in enumerate(VARIANT_ITEMS.get(item["key"], [])):
            db.add(
                MenuItemVariant(
                    menu_item_id=menu_item.id,
                    name=variant_name,
                    price=Decimal(variant_price),
                    is_default=(j == 0),
                    sort_order=j,
                )
            )
            variants_added += 1

        for j, (addon_name, addon_price) in enumerate(ADDON_ITEMS.get(item["key"], [])):
            db.add(
                MenuItemAddon(menu_item_id=menu_item.id, name=addon_name, price=Decimal(addon_price), sort_order=j)
            )
            addons_added += 1

    await db.commit()
    print(
        f"Seeded: menu for branch '{branch.slug}' — +{categories_added} categories, +{items_added} items, "
        f"+{variants_added} variants, +{addons_added} addons."
    )
    return (categories_added, items_added, variants_added, addons_added)


async def seed_tables(db: AsyncSession, branch: Restaurant) -> int:
    """Creates T1-T8 dine-in tables plus the ONLINE anchor table for this
    branch, if it has zero tables yet. Returns number of tables added."""
    existing = await db.execute(
        select(RestaurantTable.id).where(RestaurantTable.restaurant_id == branch.id).limit(1)
    )
    if existing.scalar_one_or_none():
        print(f"Branch '{branch.slug}' already has tables — nothing to do.")
        return 0

    codes = TABLE_CODES + [ONLINE_TABLE_CODE]
    for code in codes:
        db.add(RestaurantTable(restaurant_id=branch.id, code=code, is_active=True))
    await db.commit()
    print(f"Seeded: {len(codes)} tables for branch '{branch.slug}' ({', '.join(codes)}).")
    return len(codes)


async def seed_org_owner(db: AsyncSession, org: Organization) -> list[str]:
    """Creates the single org-wide super_admin login, idempotent by email."""
    existing = await db.execute(select(User).where(User.email == OWNER_EMAIL))
    if existing.scalar_one_or_none():
        print("Prince Corner owner login already exists — nothing to do.")
        return []

    db.add(
        User(
            organization_id=org.id,
            restaurant_id=None,
            name="Prince Corner Owner",
            email=OWNER_EMAIL,
            password_hash=hash_password(DEFAULT_PASSWORD),
            role=RoleEnum.super_admin,
        )
    )
    await db.commit()
    print(f"Seeded: 1 login ({OWNER_EMAIL}) — password '{DEFAULT_PASSWORD}'.")
    return [OWNER_EMAIL]


async def seed_branch_users(db: AsyncSession, org: Organization, branch: Restaurant, spec: dict) -> list[str]:
    """Creates the 3 branch-level logins (manager/kitchen/cashier) for one
    branch, idempotent by email."""
    area = spec["area"]
    users_to_create = [
        (_branch_staff_email("manager", spec["area_key"]), f"{area} Branch Manager", RoleEnum.owner, org.id, branch.id),
        (_branch_staff_email("kitchen", spec["area_key"]), f"{area} Kitchen Staff", RoleEnum.kitchen, org.id, branch.id),
        (_branch_staff_email("cashier", spec["area_key"]), f"{area} Counter Staff", RoleEnum.cashier, org.id, branch.id),
    ]

    created: list[str] = []
    for email, name, role, organization_id, restaurant_id in users_to_create:
        existing = await db.execute(select(User).where(User.email == email))
        if existing.scalar_one_or_none():
            continue
        db.add(
            User(
                organization_id=organization_id,
                restaurant_id=restaurant_id,
                name=name,
                email=email,
                password_hash=hash_password(DEFAULT_PASSWORD),
                role=role,
            )
        )
        created.append(email)

    if created:
        await db.commit()
        print(f"Seeded: {len(created)} login(s) ({', '.join(created)}) — password '{DEFAULT_PASSWORD}' for all.")
    else:
        print("Prince Corner logins already exist — nothing to do.")

    return created


async def seed(db: AsyncSession) -> None:
    """Orchestrates the full Prince Corner tenant: organization, 4 real
    branches (Isanpur, Maninagar, Vastrapur, Satellite), branding, per-branch
    site settings/menu/tables/staff, and the one org-wide owner login. Every
    step is independently idempotent — safe to call any number of times.
    Never touches `default-org`/`default` or any other seeded demo
    organization."""
    org = await seed_org(db)
    await seed_branding(db)
    await seed_org_owner(db, org)

    for spec in BRANCH_SPECS:
        branch = await seed_branch(db, org, spec)
        await seed_site_settings(db, branch, spec)
        await seed_menu(db, branch)
        await seed_tables(db, branch)
        await seed_branch_users(db, org, branch, spec)


async def _main() -> None:
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(_main())
