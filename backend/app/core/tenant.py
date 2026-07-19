from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.restaurant import Restaurant

DEFAULT_RESTAURANT_SLUG = "default"


async def get_current_restaurant(db: AsyncSession = Depends(get_db)) -> Restaurant:
    """Phase 1 is single-tenant: exactly one Restaurant row, seeded once.

    The schema is already multi-tenant-shaped (every table FKs to
    restaurant_id), so a future phase can add a real tenant resolver
    (subdomain/header-based) here without touching any router or model.
    """
    result = await db.execute(select(Restaurant).where(Restaurant.slug == DEFAULT_RESTAURANT_SLUG))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Restaurant not seeded — run `python -m app.seed`")
    return restaurant
