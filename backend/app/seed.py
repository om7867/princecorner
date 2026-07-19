"""One-command bootstrap for a fresh machine: creates the database if it
doesn't exist (Postgres), runs every Alembic migration to head, then seeds
demo content + one Owner user. Idempotent — safe to re-run any time; seeding
is skipped if the restaurant already exists, and migrations only apply
what's missing.

Run with (from backend/, venv active): python -m app.seed
"""

import asyncio
from decimal import Decimal
from pathlib import Path

import sqlalchemy as sa
from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from sqlalchemy import select
from sqlalchemy.engine import make_url

from app.core.config import get_settings
from app.core.security import hash_password
from app.core.tenant import DEFAULT_RESTAURANT_SLUG
from app.db.session import AsyncSessionLocal
from app.models.inventory import Ingredient, MenuItemIngredient, Supplier
from app.models.menu import MenuCategory, MenuItem
from app.models.promotions import Coupon, CouponTypeEnum
from app.models.restaurant import Restaurant
from app.models.site_settings import SiteSettings
from app.models.table import RestaurantTable
from app.models.user import RoleEnum, User

BACKEND_DIR = Path(__file__).resolve().parent.parent

OWNER_EMAIL = get_settings().seed_owner_email
OWNER_PASSWORD = get_settings().seed_owner_password


def ensure_database_exists() -> None:
    """Creates the target Postgres database if it doesn't exist yet, by
    connecting to the server's maintenance DB. SQLite needs nothing — the
    file is created on first connect."""
    url = make_url(get_settings().sync_database_url)
    if url.drivername.startswith("sqlite"):
        return

    try:
        engine = sa.create_engine(url)
        with engine.connect():
            pass
        engine.dispose()
        return  # database already there
    except sa.exc.OperationalError as exc:
        # Only handle "database does not exist" — bad credentials / server
        # down should fail loudly, not silently try to CREATE DATABASE.
        if "does not exist" not in str(exc):
            raise

    admin_engine = sa.create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        conn.execute(sa.text(f'CREATE DATABASE "{url.database}"'))
    admin_engine.dispose()
    print(f"Created database: {url.database}")


def run_migrations() -> None:
    """Applies every Alembic migration up to head — creates all tables on an
    empty database, or just the missing increments on an existing one."""
    cfg = AlembicConfig(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    alembic_command.upgrade(cfg, "head")
    print("Migrations up to date (alembic head).")

CATEGORIES = [
    {"slug": "starters", "name": "Starters"},
    {"slug": "mains", "name": "Mains"},
    {"slug": "drinks", "name": "Drinks"},
    {"slug": "desserts", "name": "Desserts"},
]


def _unsplash(photo_id: str, w: int = 800) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w={w}&q=80&auto=format&fit=crop"


MENU_ITEMS = [
    {
        "id": "charred-octopus",
        "category": "starters",
        "name": "Charred Octopus",
        "description": "Slow-braised octopus, smoked paprika oil, charred lemon, sea salt.",
        "price": "18",
        "dietary": ["gluten-free"],
        "tone": "charred",
        "photo": (_unsplash("1504674900247-0877df9cc836"), "Charred octopus plated with smoked paprika oil and herbs"),
    },
    {
        "id": "burrata-fig",
        "category": "starters",
        "name": "Burrata & Fig",
        "description": "Hand-torn burrata, roasted fig, aged balsamic, toasted walnut.",
        "price": "16",
        "dietary": ["vegetarian", "contains-nuts"],
        "tone": "cream",
        "photo": (_unsplash("1546069901-ba9599a7e63c"), "Fresh burrata and fig salad bowl with greens"),
    },
    {
        "id": "sourdough-board",
        "category": "starters",
        "name": "Sourdough Board",
        "description": "Our 3-day levain, whipped cultured butter, olive oil, sea salt flake.",
        "price": "12",
        "dietary": ["vegetarian"],
        "tone": "warm",
        "photo": (_unsplash("1509440159596-0249088772ff"), "Rustic sourdough loaves fresh from the oven"),
    },
    {
        "id": "slow-roasted-lamb",
        "category": "mains",
        "name": "Slow-Roasted Lamb Shoulder",
        "description": "Eight-hour lamb, rosemary jus, charred carrot, sage butter.",
        "price": "34",
        "dietary": ["gluten-free"],
        "tone": "charred",
        "photo": (_unsplash("1544025162-d76694265947"), "Slow-roasted lamb shoulder on a wooden serving board"),
    },
    {
        "id": "wild-mushroom-risotto",
        "category": "mains",
        "name": "Wild Mushroom Risotto",
        "description": "Arborio rice, foraged mushrooms, aged parmesan, black truffle oil.",
        "price": "26",
        "dietary": ["vegetarian", "gluten-free"],
        "tone": "sage",
        "photo": (_unsplash("1512621776951-a57141f2eefd"), "Creamy wild mushroom risotto bowl with fresh vegetables"),
    },
    {
        "id": "seared-catch",
        "category": "mains",
        "name": "Seared Catch of the Day",
        "description": "Market fish, brown butter, capers, charred lemon, herb oil.",
        "price": "31",
        "dietary": ["gluten-free"],
        "tone": "warm",
        "photo": (_unsplash("1414235077428-338989a2e8c0"), "Seared fish of the day plated at a candlelit table"),
    },
    {
        "id": "hand-poured-espresso",
        "category": "drinks",
        "name": "Hand-Poured Espresso",
        "description": "Single origin, roasted in-house, notes of stone fruit and cocoa.",
        "price": "4",
        "dietary": ["vegan"],
        "tone": "charred",
        "photo": (_unsplash("1509042239860-f550ce710b93"), "Hand-poured espresso with latte art"),
    },
    {
        "id": "smoked-old-fashioned",
        "category": "drinks",
        "name": "Smoked Old Fashioned",
        "description": "Bourbon, demerara, aromatic bitters, applewood smoke.",
        "price": "15",
        "dietary": [],
        "tone": "warm",
        "photo": (_unsplash("1470337458703-46ad1756a187"), "Smoked old fashioned cocktail being poured over ice"),
    },
    {
        "id": "sage-garden-fizz",
        "category": "drinks",
        "name": "Sage Garden Fizz",
        "description": "Gin, garden sage, elderflower, soda, citrus oil.",
        "price": "13",
        "dietary": ["vegan"],
        "tone": "sage",
        "photo": (_unsplash("1551538827-9c037cb4f32a"), "Sage garden fizz cocktail with fresh herbs and lime"),
    },
    {
        "id": "olive-oil-cake",
        "category": "desserts",
        "name": "Olive Oil Cake",
        "description": "Citrus-soaked crumb, saffron cream, candied orange.",
        "price": "11",
        "dietary": ["vegetarian"],
        "tone": "cream",
        "photo": (_unsplash("1567620905732-2d1ec7ab7445"), "Golden olive oil cake stack with saffron syrup"),
    },
    {
        "id": "dark-chocolate-tart",
        "category": "desserts",
        "name": "Dark Chocolate Tart",
        "description": "70% single-origin ganache, espresso crust, sea salt.",
        "price": "12",
        "dietary": ["vegetarian", "contains-nuts"],
        "tone": "charred",
        "photo": (_unsplash("1551024506-0bccd828d307"), "Dark chocolate tart with warm caramel pour"),
    },
    {
        "id": "honey-panna-cotta",
        "category": "desserts",
        "name": "Honey Panna Cotta",
        "description": "Wildflower honey, vanilla bean, toasted almond, orange zest.",
        "price": "10",
        "dietary": ["vegetarian", "gluten-free", "contains-nuts"],
        "tone": "cream",
        "photo": (_unsplash("1488477181946-6428a0291777"), "Honey panna cotta topped with fresh strawberries"),
    },
]


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(Restaurant).where(Restaurant.slug == DEFAULT_RESTAURANT_SLUG))
        if existing.scalar_one_or_none():
            print("Already seeded — nothing to do.")
            return

        restaurant = Restaurant(slug=DEFAULT_RESTAURANT_SLUG, name="Your Restaurant Name")
        db.add(restaurant)
        await db.flush()

        db.add(
            SiteSettings(
                restaurant_id=restaurant.id,
                tagline="Restaurant · Café · Bar · Bakery",
                description="A modern-yet-cozy restaurant & café. Explore the menu, reserve a table, and come say hello.",
                address_street="14 Baker's Lane",
                address_area="Old Mill District",
                address_city="Your City",
                maps_query="14 Baker's Lane Old Mill District",
                phone="+1 (000) 000-0000",
                whatsapp="10000000000",
                whatsapp_greeting="Hi! I'd like to book a table.",
                email="hello@example.com",
                hours=[
                    {"days": "Monday — Friday", "time": "7:00 am – 11:30 pm"},
                    {"days": "Saturday", "time": "8:00 am – 12:00 am"},
                    {"days": "Sunday", "time": "8:00 am – 9:00 pm"},
                ],
                timeslots=[
                    "12:00", "12:30", "13:00", "13:30", "14:00",
                    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
                ],
                announcement_enabled=True,
                announcement_text="This week — live jazz Thursday 8pm · Golden hour Fri 5–7pm: half-price spritzes",
                announcement_href="/bar",
                announcement_label="See what's on",
                tax_rate=Decimal("5.00"),
                loyalty_points_per_currency=Decimal("1"),
                loyalty_redeem_rate=Decimal("0.01"),
            )
        )

        category_ids: dict[str, str] = {}
        for i, cat in enumerate(CATEGORIES):
            category = MenuCategory(
                restaurant_id=restaurant.id, name=cat["name"], slug=cat["slug"], sort_order=i
            )
            db.add(category)
            await db.flush()
            category_ids[cat["slug"]] = category.id

        for i, item in enumerate(MENU_ITEMS):
            photo_src, photo_alt = item["photo"]
            db.add(
                MenuItem(
                    id=item["id"],
                    restaurant_id=restaurant.id,
                    category_id=category_ids[item["category"]],
                    name=item["name"],
                    description=item["description"],
                    base_price=Decimal(item["price"]),
                    dietary_tags=item["dietary"],
                    model_tone=item["tone"],
                    photo_url=photo_src,
                    photo_alt=photo_alt,
                    sort_order=i,
                )
            )

        for i in range(1, 13):
            db.add(RestaurantTable(restaurant_id=restaurant.id, code=f"T{i}"))

        db.add(
            Coupon(
                restaurant_id=restaurant.id,
                code="WELCOME10",
                type=CouponTypeEnum.percentage,
                value=Decimal("10"),
                min_order_amount=Decimal("20"),
                max_discount=Decimal("10"),
            )
        )

        supplier = Supplier(restaurant_id=restaurant.id, name="Local Farms Co.", contact_phone="+1 (000) 111-2222")
        db.add(supplier)
        await db.flush()

        ingredients = {
            "octopus": Ingredient(
                restaurant_id=restaurant.id, supplier_id=supplier.id, name="Octopus", unit="kg",
                stock_quantity=Decimal("20"), low_stock_threshold=Decimal("5"),
            ),
            "coffee-beans": Ingredient(
                restaurant_id=restaurant.id, supplier_id=supplier.id, name="Coffee Beans", unit="kg",
                stock_quantity=Decimal("10"), low_stock_threshold=Decimal("2"),
            ),
            "flour": Ingredient(
                restaurant_id=restaurant.id, supplier_id=supplier.id, name="Sourdough Flour", unit="kg",
                stock_quantity=Decimal("25"), low_stock_threshold=Decimal("5"),
            ),
        }
        for ingredient in ingredients.values():
            db.add(ingredient)
        await db.flush()

        db.add(MenuItemIngredient(menu_item_id="charred-octopus", ingredient_id=ingredients["octopus"].id, quantity_per_serving=Decimal("0.200")))
        db.add(MenuItemIngredient(menu_item_id="hand-poured-espresso", ingredient_id=ingredients["coffee-beans"].id, quantity_per_serving=Decimal("0.020")))
        db.add(MenuItemIngredient(menu_item_id="sourdough-board", ingredient_id=ingredients["flour"].id, quantity_per_serving=Decimal("0.150")))

        db.add(
            User(
                restaurant_id=restaurant.id,
                name="Owner",
                email=OWNER_EMAIL,
                password_hash=hash_password(OWNER_PASSWORD),
                role=RoleEnum.owner,
            )
        )

        await db.commit()

        print(
            "Seeded: 1 restaurant, 4 categories, 12 menu items, 12 tables, 1 coupon (WELCOME10), "
            "1 supplier, 3 ingredients with recipes, 1 owner user "
            f"({OWNER_EMAIL} / {OWNER_PASSWORD})"
        )
        print("Dev-only credentials — change immediately before any real deployment.")


def bootstrap() -> None:
    ensure_database_exists()
    run_migrations()
    asyncio.run(seed())


if __name__ == "__main__":
    bootstrap()
