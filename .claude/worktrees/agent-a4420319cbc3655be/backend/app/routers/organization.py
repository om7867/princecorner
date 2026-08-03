from collections import defaultdict
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_super_admin
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.analytics import AnalyticsSummary, DailyRevenuePoint, HourlyOrders, TopItem
from app.schemas.organization import (
    BranchCreate,
    BranchRead,
    BranchUpdate,
    OrganizationBrandingRead,
    OrganizationBrandingUpdate,
)
from app.services.analytics import get_summary
from app.services.organization import count_active_branches, create_branch, get_branding, push_branding_to_branches, update_branding

router = APIRouter(prefix="/admin/org", tags=["organization"], dependencies=[Depends(require_super_admin)])


@router.get("/branches", response_model=list[BranchRead])
async def list_branches(
    include_archived: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BranchRead]:
    query = select(Restaurant).where(Restaurant.organization_id == current_user.organization_id)
    if not include_archived:
        query = query.where(Restaurant.is_active.is_(True))
    branches = (await db.execute(query)).scalars().all()
    return [BranchRead.model_validate(b) for b in branches]


@router.post("/branches", response_model=BranchRead)
async def create_branch_route(
    payload: BranchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BranchRead:
    existing = await db.execute(select(Restaurant).where(Restaurant.slug == payload.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Slug already taken")

    restaurant = await create_branch(db, current_user.organization_id, payload)
    return BranchRead.model_validate(restaurant)


@router.patch("/branches/{branch_id}", response_model=BranchRead)
async def update_branch(
    branch_id: str,
    payload: BranchUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BranchRead:
    restaurant = await db.get(Restaurant, branch_id)
    if not restaurant or restaurant.organization_id != current_user.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Branch not found")

    updates = payload.model_dump(exclude_unset=True)
    if updates.get("is_active") is False and restaurant.is_active:
        active_count = await count_active_branches(db, current_user.organization_id)
        if active_count <= 1:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Can't archive the last active branch")

    for field, value in updates.items():
        setattr(restaurant, field, value)

    await db.commit()
    await db.refresh(restaurant)
    return BranchRead.model_validate(restaurant)


@router.get("/branding", response_model=OrganizationBrandingRead)
async def get_org_branding(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> OrganizationBrandingRead:
    org = await get_branding(db, current_user.organization_id)
    return OrganizationBrandingRead.model_validate(org)


@router.patch("/branding", response_model=OrganizationBrandingRead)
async def update_org_branding(
    payload: OrganizationBrandingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrganizationBrandingRead:
    org = await update_branding(db, current_user.organization_id, payload)
    return OrganizationBrandingRead.model_validate(org)


@router.post("/branding/push")
async def push_org_branding(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> dict:
    updated = await push_branding_to_branches(db, current_user.organization_id)
    return {"branches_updated": updated}


@router.get("/analytics/summary", response_model=AnalyticsSummary)
async def analytics_summary(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyticsSummary:
    result = await db.execute(
        select(Restaurant).where(
            Restaurant.organization_id == current_user.organization_id, Restaurant.is_active.is_(True)
        )
    )
    branches = result.scalars().all()

    if not branches:
        return AnalyticsSummary(
            today_revenue=Decimal("0"),
            today_order_count=0,
            average_order_value=Decimal("0"),
            pending_order_count=0,
            low_stock_count=0,
            revenue_series=[],
            top_items=[],
            orders_by_hour=[HourlyOrders(hour=h, order_count=0) for h in range(24)],
        )

    summaries = [await get_summary(db, branch.id, days) for branch in branches]

    today_revenue = sum((s.today_revenue for s in summaries), Decimal("0"))
    today_order_count = sum(s.today_order_count for s in summaries)
    pending_order_count = sum(s.pending_order_count for s in summaries)
    low_stock_count = sum(s.low_stock_count for s in summaries)

    total_revenue = Decimal("0")
    total_order_count = 0
    by_day: dict[str, dict] = defaultdict(lambda: {"revenue": Decimal("0"), "order_count": 0})
    for s in summaries:
        for point in s.revenue_series:
            by_day[point.date]["revenue"] += point.revenue
            by_day[point.date]["order_count"] += point.order_count
            total_revenue += point.revenue
            total_order_count += point.order_count
    revenue_series = [
        DailyRevenuePoint(date=day, revenue=data["revenue"], order_count=data["order_count"])
        for day, data in sorted(by_day.items())
    ]

    average_order_value = (total_revenue / total_order_count) if total_order_count else Decimal("0")

    item_stats: dict[str, dict] = defaultdict(lambda: {"quantity": 0, "revenue": Decimal("0")})
    for s in summaries:
        for item in s.top_items:
            item_stats[item.name]["quantity"] += item.quantity
            item_stats[item.name]["revenue"] += item.revenue
    top_items = sorted(
        (TopItem(name=name, quantity=stats["quantity"], revenue=stats["revenue"]) for name, stats in item_stats.items()),
        key=lambda t: t.quantity,
        reverse=True,
    )[:10]

    hour_counts: dict[int, int] = defaultdict(int)
    for s in summaries:
        for hourly in s.orders_by_hour:
            hour_counts[hourly.hour] += hourly.order_count
    orders_by_hour = [HourlyOrders(hour=h, order_count=hour_counts.get(h, 0)) for h in range(24)]

    return AnalyticsSummary(
        today_revenue=today_revenue,
        today_order_count=today_order_count,
        average_order_value=average_order_value,
        pending_order_count=pending_order_count,
        low_stock_count=low_stock_count,
        revenue_series=revenue_series,
        top_items=top_items,
        orders_by_hour=orders_by_hour,
    )
