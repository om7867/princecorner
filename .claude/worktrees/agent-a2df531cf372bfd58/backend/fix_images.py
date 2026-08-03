import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import update

from app.models.menu import MenuItem
from app.core.config import get_settings

engine = create_async_engine(get_settings().database_url, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def fix_images():
    async with AsyncSessionLocal() as db:
        await db.execute(update(MenuItem).values(photo_url=None))
        await db.commit()
        print("Images cleared.")

if __name__ == "__main__":
    asyncio.run(fix_images())
