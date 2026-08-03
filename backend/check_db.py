import asyncio
from app.db.session import AsyncSessionLocal
from app.models.restaurant import Restaurant
from app.models.user import User
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        restaurants = (await db.execute(select(Restaurant))).scalars().all()
        print("--- RESTAURANTS & ORG IDs ---")
        for r in restaurants:
            print(f"Name: {r.name} | Slug: {r.slug} | OrgID: {r.organization_id}")
        
        users = (await db.execute(select(User))).scalars().all()
        print("\n--- USERS & ORG IDs ---")
        for u in users:
            print(f"Email: {u.email} | Role: {u.role} | OrgID: {u.organization_id} | RestID: {u.restaurant_id}")

if __name__ == "__main__":
    asyncio.run(main())
