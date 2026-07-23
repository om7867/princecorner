from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings as get_app_settings
from app.models.restaurant import Restaurant
from app.models.site_settings import SiteSettings
from app.realtime.events import SiteUpdatedEvent
from app.realtime.manager import connection_manager
from app.schemas.site_settings import SiteSettingsRead, SiteSettingsUpdate


async def get_settings_read(db: AsyncSession, restaurant: Restaurant, settings: SiteSettings) -> SiteSettingsRead:
    fields = {
        name: getattr(settings, name)
        for name in SiteSettingsRead.model_fields
        if name not in ("name", "razorpay_enabled", "razorpay_key_id") and hasattr(settings, name)
    }
    app_settings = get_app_settings()
    razorpay_enabled = bool(app_settings.razorpay_key_id and app_settings.razorpay_key_secret)
    return SiteSettingsRead(
        name=restaurant.name,
        restaurant_slug=restaurant.slug,
        razorpay_enabled=razorpay_enabled,
        razorpay_key_id=app_settings.razorpay_key_id if razorpay_enabled else None,
        **fields,
    )


async def update_settings(
    db: AsyncSession, restaurant: Restaurant, settings: SiteSettings, payload: SiteSettingsUpdate
) -> SiteSettingsRead:
    fields = payload.model_dump(exclude_unset=True)
    if "name" in fields:
        new_name = fields.pop("name")
        if new_name:
            restaurant.name = new_name
    for field, value in fields.items():
        if field == "hours" and value is not None:
            value = [h if isinstance(h, dict) else h.model_dump() for h in value]
        setattr(settings, field, value)

    await db.commit()
    await db.refresh(settings)
    await db.refresh(restaurant)

    await connection_manager.broadcast_staff(SiteUpdatedEvent())
    return await get_settings_read(db, restaurant, settings)
