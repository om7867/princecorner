"""Populates realistic demo menu/coupon data for the "Demo Bistro Group"
organization (Organization.slug == "demo-bistro-group") so the Menu Editor,
Coupons, Global Menu, and Global Coupons admin pages have something real to
show when logging in as the demo super_admin / branch admin.

Idempotent — safe to call twice without duplicating rows. Only ever touches
the demo organization and its branches; never the real "default-org" /
"default" restaurant data.

Run with (from backend/, venv active):
    python -m app.seed_demo_data.menu_promotions
"""

import asyncio
import re
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import new_uuid
from app.db.session import AsyncSessionLocal
from app.models.menu import GlobalMenuItem, MenuCategory, MenuItem, MenuItemAddon, MenuItemVariant
from app.models.organization import Organization
from app.models.promotions import Coupon, CouponTypeEnum, GlobalCoupon
from app.models.restaurant import Restaurant
from app.services.global_coupons import push_global_coupon
from app.services.global_menu import push_global_item

DEMO_ORG_SLUG = "demo-bistro-group"

CATEGORY_NAMES = ["Starters", "Mains", "Drinks", "Desserts"]


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "category"


def _unsplash(photo_id: str, w: int = 800) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w={w}&q=80&auto=format&fit=crop"


# Reuses the same dish ideas/photos/descriptions as app.seed's MENU_ITEMS so the
# demo branches look professionally photographed too — but every row here gets
# a *fresh* new_uuid() id (never the fixed string ids from app.seed, which are
# already used by the real "kelviontech" restaurant).
BRANCH_MENU_ITEMS = [
    {
        "key": "charred-octopus",
        "category": "starters",
        "name": "Charred Octopus",
        "description": "Slow-braised octopus, smoked paprika oil, charred lemon, sea salt.",
        "price": "18",
        "dietary": ["gluten-free"],
        "tone": "charred",
        "photo": (_unsplash("1504674900247-0877df9cc836"), "Charred octopus plated with smoked paprika oil and herbs"),
    },
    {
        "key": "burrata-fig",
        "category": "starters",
        "name": "Burrata & Fig",
        "description": "Hand-torn burrata, roasted fig, aged balsamic, toasted walnut.",
        "price": "16",
        "dietary": ["vegetarian", "contains-nuts"],
        "tone": "cream",
        "photo": (_unsplash("1546069901-ba9599a7e63c"), "Fresh burrata and fig salad bowl with greens"),
    },
    {
        "key": "sourdough-board",
        "category": "starters",
        "name": "Sourdough Board",
        "description": "Our 3-day levain, whipped cultured butter, olive oil, sea salt flake.",
        "price": "12",
        "dietary": ["vegetarian"],
        "tone": "warm",
        "photo": (_unsplash("1509440159596-0249088772ff"), "Rustic sourdough loaves fresh from the oven"),
    },
    {
        "key": "slow-roasted-lamb",
        "category": "mains",
        "name": "Slow-Roasted Lamb Shoulder",
        "description": "Eight-hour lamb, rosemary jus, charred carrot, sage butter.",
        "price": "34",
        "dietary": ["gluten-free"],
        "tone": "charred",
        "photo": (_unsplash("1544025162-d76694265947"), "Slow-roasted lamb shoulder on a wooden serving board"),
    },
    {
        "key": "wild-mushroom-risotto",
        "category": "mains",
        "name": "Wild Mushroom Risotto",
        "description": "Arborio rice, foraged mushrooms, aged parmesan, black truffle oil.",
        "price": "26",
        "dietary": ["vegetarian", "gluten-free"],
        "tone": "sage",
        "photo": (_unsplash("1512621776951-a57141f2eefd"), "Creamy wild mushroom risotto bowl with fresh vegetables"),
    },
    {
        "key": "seared-catch",
        "category": "mains",
        "name": "Seared Catch of the Day",
        "description": "Market fish, brown butter, capers, charred lemon, herb oil.",
        "price": "31",
        "dietary": ["gluten-free"],
        "tone": "warm",
        "photo": (_unsplash("1414235077428-338989a2e8c0"), "Seared fish of the day plated at a candlelit table"),
    },
    {
        "key": "hand-poured-espresso",
        "category": "drinks",
        "name": "Hand-Poured Espresso",
        "description": "Single origin, roasted in-house, notes of stone fruit and cocoa.",
        "price": "4",
        "dietary": ["vegan"],
        "tone": "charred",
        "photo": (_unsplash("1509042239860-f550ce710b93"), "Hand-poured espresso with latte art"),
    },
    {
        "key": "smoked-old-fashioned",
        "category": "drinks",
        "name": "Smoked Old Fashioned",
        "description": "Bourbon, demerara, aromatic bitters, applewood smoke.",
        "price": "15",
        "dietary": [],
        "tone": "warm",
        "photo": (_unsplash("1470337458703-46ad1756a187"), "Smoked old fashioned cocktail being poured over ice"),
    },
    {
        "key": "sage-garden-fizz",
        "category": "drinks",
        "name": "Sage Garden Fizz",
        "description": "Gin, garden sage, elderflower, soda, citrus oil.",
        "price": "13",
        "dietary": ["vegan"],
        "tone": "sage",
        "photo": (_unsplash("1551538827-9c037cb4f32a"), "Sage garden fizz cocktail with fresh herbs and lime"),
    },
    {
        "key": "olive-oil-cake",
        "category": "desserts",
        "name": "Olive Oil Cake",
        "description": "Citrus-soaked crumb, saffron cream, candied orange.",
        "price": "11",
        "dietary": ["vegetarian"],
        "tone": "cream",
        "photo": (_unsplash("1567620905732-2d1ec7ab7445"), "Golden olive oil cake stack with saffron syrup"),
    },
    {
        "key": "dark-chocolate-tart",
        "category": "desserts",
        "name": "Dark Chocolate Tart",
        "description": "70% single-origin ganache, espresso crust, sea salt.",
        "price": "12",
        "dietary": ["vegetarian", "contains-nuts"],
        "tone": "charred",
        "photo": (_unsplash("1551024506-0bccd828d307"), "Dark chocolate tart with warm caramel pour"),
    },
    {
        "key": "honey-panna-cotta",
        "category": "desserts",
        "name": "Honey Panna Cotta",
        "description": "Wildflower honey, vanilla bean, toasted almond, orange zest.",
        "price": "10",
        "dietary": ["vegetarian", "gluten-free", "contains-nuts"],
        "tone": "cream",
        "photo": (_unsplash("1488477181946-6428a0291777"), "Honey panna cotta topped with fresh strawberries"),
    },
]

# key -> [(variant name, price), ...]
VARIANT_ITEMS: dict[str, list[tuple[str, str]]] = {
    "hand-poured-espresso": [("Small", "4"), ("Large", "6")],
    "sage-garden-fizz": [("Regular", "13"), ("Large", "17")],
    "wild-mushroom-risotto": [("Half Portion", "18"), ("Full Portion", "26")],
}

# key -> [(addon name, price), ...]
ADDON_ITEMS: dict[str, list[tuple[str, str]]] = {
    "sourdough-board": [("Extra Cultured Butter", "2")],
    "dark-chocolate-tart": [("Vanilla Ice Cream Scoop", "3"), ("Extra Salted Caramel", "1.5")],
}

# Org-wide Global Menu templates, one per category, pushed via push_global_item.
GLOBAL_MENU_ITEMS = [
    {
        "name": "Truffle Parmesan Fries",
        "description": "Hand-cut fries, black truffle oil, shaved parmesan, herb salt.",
        "price": "9",
        "category_name": "Starters",
        "dietary": ["vegetarian"],
    },
    {
        "name": "Chargrilled Ribeye",
        "description": "28-day aged ribeye, roasted bone marrow butter, charred greens.",
        "price": "42",
        "category_name": "Mains",
        "dietary": ["gluten-free"],
    },
    {
        "name": "House Chai Latte",
        "description": "Slow-steeped spiced chai, steamed milk, cardamom foam.",
        "price": "5",
        "category_name": "Drinks",
        "dietary": ["vegetarian"],
    },
    {
        "name": "Classic Tiramisu",
        "description": "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust.",
        "price": "10",
        "category_name": "Desserts",
        "dietary": ["vegetarian"],
    },
]

# Org-wide Global Coupon templates, pushed via push_global_coupon.
GLOBAL_COUPONS = [
    {
        "code": "CHAINWIDE10",
        "type": CouponTypeEnum.percentage,
        "value": Decimal("10"),
        "min_order_amount": Decimal("25"),
        "max_discount": Decimal("15"),
    },
    {
        "code": "CHAINFLAT100",
        "type": CouponTypeEnum.flat,
        "value": Decimal("100"),
        "min_order_amount": Decimal("500"),
        "max_discount": None,
    },
]


async def _seed_branch_menu(db: AsyncSession, branch: Restaurant) -> tuple[int, int]:
    """Adds the Starters/Mains/Drinks/Desserts categories (reusing any that
    already exist) plus the full demo item set for a single branch. Skips
    entirely if the branch already has more than 1 category (already
    seeded). Returns (categories_added, items_added)."""
    result = await db.execute(select(MenuCategory).where(MenuCategory.restaurant_id == branch.id))
    existing_categories = list(result.scalars().all())
    if len(existing_categories) > 1:
        return (0, 0)

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
    for i, item in enumerate(BRANCH_MENU_ITEMS):
        category = category_by_name[item["category"]]
        photo_src, photo_alt = item["photo"]
        menu_item = MenuItem(
            id=new_uuid(),
            restaurant_id=branch.id,
            category_id=category.id,
            name=item["name"],
            description=item["description"],
            base_price=Decimal(item["price"]),
            dietary_tags=item["dietary"],
            model_tone=item["tone"],
            photo_url=photo_src,
            photo_alt=photo_alt,
            sort_order=i,
        )
        db.add(menu_item)
        items_added += 1

        for variant_name, variant_price in VARIANT_ITEMS.get(item["key"], []):
            db.add(
                MenuItemVariant(
                    menu_item_id=menu_item.id,
                    name=variant_name,
                    price=Decimal(variant_price),
                    is_default=variant_name in ("Small", "Regular", "Half Portion"),
                )
            )
        for addon_name, addon_price in ADDON_ITEMS.get(item["key"], []):
            db.add(MenuItemAddon(menu_item_id=menu_item.id, name=addon_name, price=Decimal(addon_price)))

    await db.flush()
    return (categories_added, items_added)


async def _seed_branch_coupon(db: AsyncSession, branch: Restaurant) -> bool:
    """Adds one branch-local coupon, distinct code per branch. Returns True
    if a new row was inserted."""
    code = f"{_slugify(branch.slug).upper().replace('-', '')}15"
    existing = await db.execute(select(Coupon).where(Coupon.restaurant_id == branch.id, Coupon.code == code))
    if existing.scalar_one_or_none():
        return False

    db.add(
        Coupon(
            restaurant_id=branch.id,
            code=code,
            type=CouponTypeEnum.percentage,
            value=Decimal("15"),
            min_order_amount=Decimal("20"),
            max_discount=Decimal("20"),
        )
    )
    await db.flush()
    return True


async def _seed_global_menu_items(db: AsyncSession, organization_id: str) -> tuple[int, int]:
    """Creates the org-wide Global Menu item templates (skipping any that
    already exist by name), then pushes every one of them (existing or new)
    via the real `push_global_item` so per-branch MenuItem rows are created/
    kept in sync — including for any branch added after the first run.
    Returns (templates_created, items_touched_by_push)."""
    created = 0
    touched = 0
    for entry in GLOBAL_MENU_ITEMS:
        existing = await db.execute(
            select(GlobalMenuItem).where(
                GlobalMenuItem.organization_id == organization_id,
                GlobalMenuItem.name == entry["name"],
            )
        )
        global_item = existing.scalar_one_or_none()
        if not global_item:
            global_item = GlobalMenuItem(
                organization_id=organization_id,
                name=entry["name"],
                description=entry["description"],
                base_price=Decimal(entry["price"]),
                category_name=entry["category_name"],
                dietary_tags=entry["dietary"],
            )
            db.add(global_item)
            await db.flush()
            created += 1

        touched += await push_global_item(db, global_item)

    return (created, touched)


async def _seed_global_coupons(db: AsyncSession, organization_id: str) -> tuple[int, int]:
    """Creates the org-wide Global Coupon templates (skipping any that
    already exist by code), then pushes every one of them (existing or new)
    via the real `push_global_coupon`. Returns (templates_created,
    branches_touched_by_push)."""
    created = 0
    touched = 0
    for entry in GLOBAL_COUPONS:
        existing = await db.execute(
            select(GlobalCoupon).where(
                GlobalCoupon.organization_id == organization_id,
                GlobalCoupon.code == entry["code"],
            )
        )
        global_coupon = existing.scalar_one_or_none()
        if not global_coupon:
            global_coupon = GlobalCoupon(
                organization_id=organization_id,
                code=entry["code"],
                type=entry["type"],
                value=entry["value"],
                min_order_amount=entry["min_order_amount"],
                max_discount=entry["max_discount"],
            )
            db.add(global_coupon)
            await db.flush()
            created += 1

        branches_touched, _skipped = await push_global_coupon(db, global_coupon)
        touched += branches_touched

    return (created, touched)


async def seed(db: AsyncSession) -> None:
    """Populates demo menu/coupon data for every active branch of the
    "Demo Bistro Group" organization. Idempotent — safe to call repeatedly.
    Only ever touches that org/branches, never any real restaurant data."""
    org_result = await db.execute(select(Organization).where(Organization.slug == DEMO_ORG_SLUG))
    org = org_result.scalar_one_or_none()
    if not org:
        print(f"Demo organization ({DEMO_ORG_SLUG}) not found — nothing to do.")
        return

    branches_result = await db.execute(
        select(Restaurant).where(Restaurant.organization_id == org.id, Restaurant.is_active.is_(True))
    )
    branches = list(branches_result.scalars().all())

    per_branch_summary: dict[str, tuple[int, int, bool]] = {}
    for branch in branches:
        categories_added, items_added = await _seed_branch_menu(db, branch)
        coupon_added = await _seed_branch_coupon(db, branch)
        per_branch_summary[branch.slug] = (categories_added, items_added, coupon_added)

    global_items_created, global_items_touched = await _seed_global_menu_items(db, org.id)
    global_coupons_created, global_coupons_touched = await _seed_global_coupons(db, org.id)

    await db.commit()

    for slug, (categories_added, items_added, coupon_added) in per_branch_summary.items():
        print(
            f"Branch '{slug}': +{categories_added} categories, +{items_added} menu items, "
            f"coupon {'added' if coupon_added else 'already present'}"
        )
    print(
        f"Global menu: {global_items_created} template(s) created this run, "
        f"{global_items_touched} branch item(s) touched by push"
    )
    print(
        f"Global coupons: {global_coupons_created} template(s) created this run, "
        f"{global_coupons_touched} branch coupon(s) touched by push"
    )


async def _main() -> None:
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(_main())
