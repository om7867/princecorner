import asyncio
from app.db.session import AsyncSessionLocal
from app.models.restaurant import Restaurant
from app.models.order import Order
from app.services.orders import list_all_orders
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        restaurants = (await db.execute(select(Restaurant))).scalars().all()
        print("=== ALL RESTAURANTS IN DB ===")
        for r in restaurants:
            orders = (await db.execute(select(Order).where(Order.restaurant_id == r.id))).scalars().all()
            print(f"Name: {r.name:<30} | ID: {r.id} | Orders Count: {len(orders)}")
            for o in orders:
                print(f"   -> OrderID: {o.id} | Code: {o.display_code} | Channel: {o.channel} | Status: '{o.status}' (type: {type(o.status)}) | TableID: {o.table_id}")

        print("\n=== TESTING list_all_orders() FOR PRINCE CORNER ISANPUR ===")
        isanpur = (await db.execute(select(Restaurant).where(Restaurant.slug == "prince-corner-isanpur"))).scalar_one_or_none()
        if isanpur:
            results = await list_all_orders(db, isanpur.id)
            print(f"list_all_orders returned {len(results)} items:")
            for res in results:
                print(f"   DTO -> ID: {res.id} | Code: {res.display_code} | Status: '{res.status}' | Table: '{res.table_code}' | Channel: '{res.channel}'")

if __name__ == "__main__":
    asyncio.run(main())
