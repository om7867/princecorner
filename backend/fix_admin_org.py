import asyncio
from app.db.session import AsyncSessionLocal
from app.models.restaurant import Restaurant
from app.models.user import User, RoleEnum
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        # Find Prince Corner - Isanpur
        res = await db.execute(select(Restaurant).where(Restaurant.slug == "prince-corner-isanpur"))
        isanpur = res.scalar_one_or_none()
        if not isanpur:
            print("Isanpur branch not found!")
            return

        print(f"Prince Corner Isanpur ID: {isanpur.id}, OrgID: {isanpur.organization_id}")

        # Update owner@example.com user to Prince Corner org & branch so default login sees Prince Corner orders!
        users = (await db.execute(select(User))).scalars().all()
        for u in users:
            if u.email in ["owner@example.com", "demo.superadmin@example.com", "platform@example.com"]:
                u.organization_id = isanpur.organization_id
                u.restaurant_id = isanpur.id
                u.role = RoleEnum.super_admin
                db.add(u)
        
        await db.commit()
        print("Updated admin users to Prince Corner organization successfully!")

if __name__ == "__main__":
    asyncio.run(main())
