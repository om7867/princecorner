from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_owner_admin
from app.core.tenant import get_current_restaurant_for_staff, get_current_restaurant_public
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.site_settings import SiteSettings
from app.schemas.site_settings import SiteSettingsRead, SiteSettingsUpdate
from app.services.settings import get_settings_read, update_settings

router = APIRouter(tags=["settings"])


async def _get_settings_row(db: AsyncSession, restaurant: Restaurant) -> SiteSettings:
    result = await db.execute(select(SiteSettings).where(SiteSettings.restaurant_id == restaurant.id))
    return result.scalar_one()


@router.get("/settings", response_model=SiteSettingsRead)
async def read_settings(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_public)
) -> SiteSettingsRead:
    settings = await _get_settings_row(db, restaurant)
    return await get_settings_read(db, restaurant, settings)


@router.patch("/settings", response_model=SiteSettingsRead)
async def patch_settings(
    payload: SiteSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
    _user=Depends(require_owner_admin),
) -> SiteSettingsRead:
    settings = await _get_settings_row(db, restaurant)
    return await update_settings(db, restaurant, settings, payload)
