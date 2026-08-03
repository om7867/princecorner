import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from app.models.menu import MenuCategory, MenuItem
from app.models.restaurant import Restaurant

from app.core.config import get_settings

engine = create_async_engine(get_settings().database_url, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def seed():
    async with AsyncSessionLocal() as db:
        # Get restaurant
        result = await db.execute(select(Restaurant).limit(1))
        restaurant = result.scalar_one_or_none()
        
        if not restaurant:
            print("No restaurant found! Creating one...")
            restaurant = Restaurant(name="The Grand Hotel")
            db.add(restaurant)
            await db.commit()
            await db.refresh(restaurant)
        
        # Categories
        cat_starters = MenuCategory(restaurant_id=restaurant.id, name="Vegetarian Starters", slug="veg-starters", sort_order=1)
        cat_mains = MenuCategory(restaurant_id=restaurant.id, name="Vegetarian Mains", slug="veg-mains", sort_order=2)
        cat_desserts = MenuCategory(restaurant_id=restaurant.id, name="Desserts", slug="desserts", sort_order=3)
        
        db.add_all([cat_starters, cat_mains, cat_desserts])
        await db.commit()
        await db.refresh(cat_starters)
        await db.refresh(cat_mains)
        await db.refresh(cat_desserts)

        # Items
        items = [
            MenuItem(
                restaurant_id=restaurant.id,
                category_id=cat_starters.id,
                name="Tandoori Paneer Tikka",
                description="Cottage cheese marinated in yogurt and Indian spices, cooked in a tandoor.",
                base_price=350.00,
                dietary_tags=["vegetarian", "gluten-free"],
                photo_url="https://images.unsplash.com/photo-1599487405270-8798e404fcfa?q=80&w=1000&auto=format&fit=crop",
                is_available=True,
                is_active=True,
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                category_id=cat_starters.id,
                name="Crispy Corn & Spinach Tikki",
                description="Golden fried patties of fresh spinach, sweet corn, and mild spices.",
                base_price=280.00,
                dietary_tags=["vegetarian"],
                photo_url="https://images.unsplash.com/photo-1626804475297-4c636f88cb0c?q=80&w=1000&auto=format&fit=crop",
                is_available=True,
                is_active=True,
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                category_id=cat_mains.id,
                name="Dal Makhani",
                description="Slow-cooked black lentils and kidney beans enriched with butter and cream.",
                base_price=450.00,
                dietary_tags=["vegetarian"],
                photo_url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop",
                is_available=True,
                is_active=True,
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                category_id=cat_mains.id,
                name="Mushroom Truffle Risotto",
                description="Creamy arborio rice with wild mushrooms, finished with truffle oil and parmesan.",
                base_price=650.00,
                dietary_tags=["vegetarian", "contains-dairy"],
                photo_url="https://images.unsplash.com/photo-1476124369491-e9addf5db378?q=80&w=1000&auto=format&fit=crop",
                is_available=True,
                is_active=True,
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                category_id=cat_mains.id,
                name="Vegetable Biryani",
                description="Fragrant basmati rice layered with mixed vegetables, saffron, and aromatic spices.",
                base_price=480.00,
                dietary_tags=["vegetarian"],
                photo_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop",
                is_available=True,
                is_active=True,
            ),
            MenuItem(
                restaurant_id=restaurant.id,
                category_id=cat_desserts.id,
                name="Saffron Rasmalai",
                description="Soft cottage cheese dumplings soaked in sweetened, thickened milk delicately flavored with saffron.",
                base_price=220.00,
                dietary_tags=["vegetarian", "sweet"],
                photo_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop",
                is_available=True,
                is_active=True,
            )
        ]
        
        db.add_all(items)
        await db.commit()
        print("Menu seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
