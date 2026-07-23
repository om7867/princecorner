"""Demo inventory + staff data for the "Demo Bistro Group" organization only.

Populates Suppliers, Ingredients (with a couple of deliberately low-stock
rows), a handful of Recipe links against whatever real menu items exist,
inter-branch Inventory Transfer Requests (pending/rejected/completed), and
extra Staff users for every active branch of the `demo-bistro-group` org —
so the Inventory, Staff, and Transfers admin pages have something realistic
to show when logged in as the demo super_admin.

Idempotent:
  - Suppliers/Ingredients/Recipes: skipped per-branch if a supplier with one
    of this module's marker names already exists for that restaurant.
  - Staff: checked one-by-one by email (the column is unique anyway).
  - Transfer requests: skipped org-wide if any request with this module's
    `DEMO-SEED:` note marker already exists for the org.
Safe to call `seed()` any number of times without duplicating rows.

Run with (from backend/, venv active):
    python -m app.seed_demo_data.inventory_staff
"""

import asyncio
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.inventory import Ingredient, InventoryTransferRequest, MenuItemIngredient, Supplier, TransferStatusEnum
from app.models.menu import MenuItem
from app.models.organization import Organization
from app.models.restaurant import Restaurant
from app.models.user import RoleEnum, User
from app.schemas.inventory import TransferRequestCreate, TransferRequestDecision
from app.services.inventory import create_transfer_request, decide_transfer_request

DEMO_ORG_SLUG = "demo-bistro-group"

# Distinctive markers that separate this module's rows from anything else,
# used as the idempotency check.
SUPPLIER_MARKER_NAME = "Metro Fresh Produce Co."
TRANSFER_NOTE_MARKER = "DEMO-SEED:"

DEMO_STAFF_PASSWORD = "DemoStaff123!"  # nosec - dev-only shared demo password

# name, unit, base stock, base low-stock threshold, category (for supplier grouping)
INGREDIENT_CATALOG = [
    ("Tomatoes", "kg", Decimal("40"), Decimal("8"), "produce"),
    ("Onions", "kg", Decimal("35"), Decimal("8"), "produce"),
    ("Lettuce", "kg", Decimal("10"), Decimal("3"), "produce"),
    ("Chicken Breast", "kg", Decimal("25"), Decimal("6"), "meat"),
    ("Basmati Rice", "kg", Decimal("50"), Decimal("10"), "dry"),
    ("Olive Oil", "L", Decimal("18"), Decimal("4"), "dry"),
    ("Fresh Cream", "L", Decimal("12"), Decimal("4"), "dairy"),
    ("Mozzarella Cheese", "kg", Decimal("15"), Decimal("4"), "dairy"),
    ("Butter", "kg", Decimal("10"), Decimal("3"), "dairy"),
    ("Coffee Beans", "kg", Decimal("8"), Decimal("2"), "dry"),
    ("All-Purpose Flour", "kg", Decimal("30"), Decimal("6"), "dry"),
    ("Eggs", "pcs", Decimal("200"), Decimal("40"), "produce"),
]

STAFF_ROLE_TEMPLATES = [
    (RoleEnum.manager, "manager"),
    (RoleEnum.cashier, "cashier"),
    (RoleEnum.kitchen, "kitchen"),
    (RoleEnum.waiter, "waiter"),
]

STAFF_NAMES = [
    "Devika Rao", "Farhan Ali", "Meera Pillai", "Sameer Khan", "Anjali Bhat",
    "Rajiv Menon", "Sunita Deshmukh", "Imran Sheikh", "Lakshmi Iyer", "Vivek Nair",
    "Tara Chandran", "Yusuf Ansari",
]


def _branch_short_slug(slug: str) -> str:
    return slug[len("demo-") :] if slug.startswith("demo-") else slug


async def _seed_supplies_for_branch(db: AsyncSession, restaurant: Restaurant) -> dict[str, int]:
    """Seeds suppliers + ingredients + recipe links for one branch. Skips
    entirely (returns zero counts) if already seeded for this restaurant."""
    counts = {"suppliers": 0, "ingredients": 0, "low_stock": 0, "recipes": 0}

    existing = await db.execute(
        select(Supplier.id).where(Supplier.restaurant_id == restaurant.id, Supplier.name == SUPPLIER_MARKER_NAME)
    )
    if existing.scalar_one_or_none():
        print(f"  [{restaurant.slug}] suppliers/ingredients already seeded — skipping.")
        return counts

    rng = random.Random(f"inv-{restaurant.id}")

    supplier_produce = Supplier(
        restaurant_id=restaurant.id,
        name=SUPPLIER_MARKER_NAME,
        contact_phone=f"+91{rng.randint(6000000000, 9999999999)}",
        contact_email=f"orders@{_branch_short_slug(restaurant.slug)}.metrofresh.demo",
    )
    supplier_other = Supplier(
        restaurant_id=restaurant.id,
        name="Golden Valley Dairy & Meats",
        contact_phone=f"+91{rng.randint(6000000000, 9999999999)}",
        contact_email=f"supply@{_branch_short_slug(restaurant.slug)}.goldenvalley.demo",
    )
    db.add(supplier_produce)
    db.add(supplier_other)
    await db.flush()
    counts["suppliers"] = 2

    chosen = rng.sample(INGREDIENT_CATALOG, k=9)
    low_stock_names = set(rng.sample([c[0] for c in chosen], k=2))

    created_ingredients: list[Ingredient] = []
    for name, unit, base_stock, base_threshold, category in chosen:
        supplier = supplier_produce if category == "produce" else supplier_other
        if name in low_stock_names:
            stock_quantity = Decimal("2")
            low_stock_threshold = Decimal("5")
        else:
            jitter = Decimal(rng.randint(-3, 6))
            stock_quantity = max(base_stock + jitter, base_threshold + Decimal("1"))
            low_stock_threshold = base_threshold

        ingredient = Ingredient(
            restaurant_id=restaurant.id,
            supplier_id=supplier.id,
            name=name,
            unit=unit,
            stock_quantity=stock_quantity,
            low_stock_threshold=low_stock_threshold,
        )
        db.add(ingredient)
        created_ingredients.append(ingredient)

    await db.flush()
    counts["ingredients"] = len(created_ingredients)
    counts["low_stock"] = len(low_stock_names)

    # ---------- Recipes against real menu items, if any exist yet ----------
    items_result = await db.execute(
        select(MenuItem).where(MenuItem.restaurant_id == restaurant.id).order_by(MenuItem.sort_order).limit(4)
    )
    menu_items = list(items_result.scalars().all())

    if not menu_items:
        print(f"  [{restaurant.slug}] no menu items yet — skipping recipe-linking for this branch.")
    else:
        for menu_item in menu_items:
            num_links = rng.randint(1, 2)
            for ingredient in rng.sample(created_ingredients, k=min(num_links, len(created_ingredients))):
                existing_link = await db.execute(
                    select(MenuItemIngredient.id).where(
                        MenuItemIngredient.menu_item_id == menu_item.id,
                        MenuItemIngredient.ingredient_id == ingredient.id,
                    )
                )
                if existing_link.scalar_one_or_none():
                    continue
                quantity_per_serving = (
                    Decimal(str(rng.randint(1, 3)))
                    if ingredient.unit == "pcs"
                    else Decimal(str(rng.randint(50, 300))) / Decimal("1000")
                )
                db.add(
                    MenuItemIngredient(
                        menu_item_id=menu_item.id,
                        ingredient_id=ingredient.id,
                        quantity_per_serving=quantity_per_serving,
                    )
                )
                counts["recipes"] += 1

    await db.flush()
    return counts


async def _seed_staff_for_branch(db: AsyncSession, restaurant: Restaurant) -> int:
    """Adds 3 more staff users (manager/cashier/kitchen) for one branch,
    skipping any whose email already exists. Returns the number created."""
    rng = random.Random(f"staff-{restaurant.id}")
    short_slug = _branch_short_slug(restaurant.slug)
    created = 0

    names = list(STAFF_NAMES)
    rng.shuffle(names)

    for i, (role, role_slug) in enumerate(STAFF_ROLE_TEMPLATES[:3]):
        email = f"{role_slug}.{short_slug}@demo.example.com"
        existing = await db.execute(select(User.id).where(User.email == email))
        if existing.scalar_one_or_none():
            continue

        db.add(
            User(
                organization_id=restaurant.organization_id,
                restaurant_id=restaurant.id,
                name=names[i % len(names)],
                email=email,
                password_hash=hash_password(DEMO_STAFF_PASSWORD),
                role=role,
            )
        )
        created += 1

    await db.flush()
    return created


async def _pick_requester(db: AsyncSession, restaurant_id: str) -> str | None:
    """Any staff user belonging to this branch, preferring admin/manager."""
    result = await db.execute(
        select(User)
        .where(User.restaurant_id == restaurant_id, User.is_active.is_(True))
        .order_by(User.role)
        .limit(1)
    )
    user = result.scalar_one_or_none()
    return user.id if user else None


async def _seed_transfers(db: AsyncSession, organization_id: str, branches: list[Restaurant]) -> int:
    """Creates 3-4 inter-branch transfer requests (pending/rejected/completed).
    Skipped org-wide if any request with our note marker already exists.
    Requires at least 2 active branches — returns 0 otherwise."""
    if len(branches) < 2:
        print("  only one active branch — skipping transfer requests (needs 2+).")
        return 0

    existing = await db.execute(
        select(InventoryTransferRequest.id)
        .where(
            InventoryTransferRequest.organization_id == organization_id,
            InventoryTransferRequest.note.like(f"{TRANSFER_NOTE_MARKER}%"),
        )
        .limit(1)
    )
    if existing.scalar_one_or_none():
        print("  transfer requests already seeded for this org — skipping.")
        return 0

    branch_a, branch_b = branches[0], branches[1]
    branch_c = branches[2] if len(branches) > 2 else branches[0]

    requester_a = await _pick_requester(db, branch_a.id)
    requester_b = await _pick_requester(db, branch_b.id)
    if not requester_a or not requester_b:
        print("  no staff users found on the branches yet — skipping transfer requests.")
        return 0

    count = 0

    # 1. Pending — branch_a asks branch_b for rice.
    await create_transfer_request(
        db,
        organization_id=organization_id,
        to_restaurant_id=branch_a.id,
        from_restaurant_id=branch_b.id,
        requested_by_user_id=requester_a,
        payload=TransferRequestCreate(
            from_restaurant_id=branch_b.id,
            ingredient_name="Basmati Rice",
            unit="kg",
            quantity=Decimal("10"),
            note=f"{TRANSFER_NOTE_MARKER} weekend rush restock",
        ),
    )
    count += 1

    # 2. Pending — branch_b asks branch_a for olive oil.
    await create_transfer_request(
        db,
        organization_id=organization_id,
        to_restaurant_id=branch_b.id,
        from_restaurant_id=branch_a.id,
        requested_by_user_id=requester_b,
        payload=TransferRequestCreate(
            from_restaurant_id=branch_a.id,
            ingredient_name="Olive Oil",
            unit="L",
            quantity=Decimal("5"),
            note=f"{TRANSFER_NOTE_MARKER} running low ahead of catering event",
        ),
    )
    count += 1

    # 3. Rejected — branch_a asked branch_c (or branch_b) for cream, declined.
    rejected = InventoryTransferRequest(
        organization_id=organization_id,
        from_restaurant_id=branch_c.id if branch_c.id != branch_a.id else branch_b.id,
        to_restaurant_id=branch_a.id,
        ingredient_name="Fresh Cream",
        unit="L",
        quantity=Decimal("3"),
        status=TransferStatusEnum.rejected,
        requested_by_user_id=requester_a,
        note=f"{TRANSFER_NOTE_MARKER} declined — source branch needed it for its own service",
        resolved_at=datetime.now(timezone.utc) - timedelta(days=1),
    )
    db.add(rejected)
    count += 1

    # 4. Completed — real stock movement via the actual approval flow. Pick an
    # ingredient we know exists at the source branch with enough stock.
    source_ing_result = await db.execute(
        select(Ingredient)
        .where(Ingredient.restaurant_id == branch_b.id, Ingredient.stock_quantity > Decimal("10"))
        .order_by(Ingredient.stock_quantity.desc())
        .limit(1)
    )
    source_ingredient = source_ing_result.scalar_one_or_none()
    if source_ingredient:
        move_qty = (source_ingredient.stock_quantity / Decimal("4")).quantize(Decimal("0.01"))
        completed_request = await create_transfer_request(
            db,
            organization_id=organization_id,
            to_restaurant_id=branch_a.id,
            from_restaurant_id=branch_b.id,
            requested_by_user_id=requester_a,
            payload=TransferRequestCreate(
                from_restaurant_id=branch_b.id,
                ingredient_name=source_ingredient.name,
                unit=source_ingredient.unit,
                quantity=move_qty,
                note=f"{TRANSFER_NOTE_MARKER} approved restock, already fulfilled",
            ),
        )
        await decide_transfer_request(
            db,
            organization_id=organization_id,
            request_id=completed_request.id,
            decision=TransferRequestDecision(status="approved"),
        )
        count += 1
    else:
        print(f"  [{branch_b.slug}] no ingredient with enough stock for a completed transfer demo — skipped that one.")

    await db.commit()
    return count


async def seed(db: AsyncSession) -> None:
    """Seeds Suppliers/Ingredients/Recipes, inter-branch Transfer Requests,
    and extra Staff for every active branch of the 'Demo Bistro Group'
    organization. Idempotent (see per-step docstrings). Never touches any
    other organization."""
    org_result = await db.execute(select(Organization).where(Organization.slug == DEMO_ORG_SLUG))
    org = org_result.scalar_one_or_none()
    if not org:
        print(f"Organization '{DEMO_ORG_SLUG}' not found — nothing to seed.")
        return

    branches_result = await db.execute(
        select(Restaurant).where(Restaurant.organization_id == org.id, Restaurant.is_active.is_(True)).order_by(Restaurant.name)
    )
    branches = list(branches_result.scalars().all())
    if not branches:
        print(f"No active branches found for organization '{DEMO_ORG_SLUG}' — nothing to seed.")
        return

    supply_totals: dict[str, dict[str, int]] = {}
    staff_totals: dict[str, int] = {}

    for branch in branches:
        print(f"Seeding supplies for branch '{branch.slug}' ({branch.name})...")
        supply_totals[branch.slug] = await _seed_supplies_for_branch(db, branch)

    for branch in branches:
        print(f"Seeding staff for branch '{branch.slug}' ({branch.name})...")
        staff_totals[branch.slug] = await _seed_staff_for_branch(db, branch)

    await db.commit()

    print("Seeding inter-branch transfer requests...")
    transfer_count = await _seed_transfers(db, org.id, branches)

    print("\nInventory/Staff seed summary:")
    for slug, counts in supply_totals.items():
        print(
            f"  {slug}: {counts['suppliers']} suppliers, {counts['ingredients']} ingredients "
            f"({counts['low_stock']} low-stock), {counts['recipes']} recipe links, "
            f"{staff_totals.get(slug, 0)} new staff"
        )
    print(f"  transfer requests created: {transfer_count}")


async def _main() -> None:
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(_main())
