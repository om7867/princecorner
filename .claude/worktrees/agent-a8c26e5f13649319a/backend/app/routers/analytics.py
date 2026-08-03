from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_menu_managers
from app.core.tenant import get_current_restaurant_for_staff
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.analytics import AnalyticsSummary
from app.services import analytics as analytics_service

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"], dependencies=[Depends(require_menu_managers)])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> AnalyticsSummary:
    return await analytics_service.get_summary(db, restaurant.id, days)
