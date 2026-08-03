from collections import defaultdict
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem, OrderStatusEnum
from app.schemas.analytics import AnalyticsSummary, DailyRevenuePoint, HourlyOrders, TopItem
from app.services.inventory import low_stock_count


async def get_summary(db: AsyncSession, restaurant_id: str, days: int) -> AnalyticsSummary:
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.restaurant_id == restaurant_id, Order.created_at >= since)
    )
    orders = list(result.scalars().all())

    today = datetime.now(timezone.utc).date()
    today_orders = [o for o in orders if o.created_at.date() == today]
    today_revenue = sum((o.total for o in today_orders), Decimal("0"))

    period_revenue = sum((o.total for o in orders), Decimal("0"))
    average_order_value = (period_revenue / len(orders)) if orders else Decimal("0")

    # Revenue series, grouped by calendar date — done in Python (not a
    # DB-specific date_trunc/strftime) so this stays portable between
    # SQLite (local dev) and Postgres (production) without two code paths.
    by_day: dict[str, list[Order]] = defaultdict(list)
    for o in orders:
        by_day[o.created_at.date().isoformat()].append(o)
    revenue_series = [
        DailyRevenuePoint(
            date=day,
            revenue=sum((o.total for o in day_orders), Decimal("0")),
            order_count=len(day_orders),
        )
        for day, day_orders in sorted(by_day.items())
    ]

    item_stats: dict[str, dict] = defaultdict(lambda: {"quantity": 0, "revenue": Decimal("0")})
    for o in orders:
        for item in o.items:
            item_stats[item.name_snapshot]["quantity"] += item.quantity
            item_stats[item.name_snapshot]["revenue"] += item.line_total
    top_items = sorted(
        (TopItem(name=name, quantity=stats["quantity"], revenue=stats["revenue"]) for name, stats in item_stats.items()),
        key=lambda t: t.quantity,
        reverse=True,
    )[:10]

    hour_counts: dict[int, int] = defaultdict(int)
    for o in orders:
        hour_counts[o.created_at.hour] += 1
    orders_by_hour = [HourlyOrders(hour=h, order_count=hour_counts.get(h, 0)) for h in range(24)]

    pending_statuses = {OrderStatusEnum.received, OrderStatusEnum.preparing, OrderStatusEnum.ready}
    pending_result = await db.execute(
        select(Order).where(Order.restaurant_id == restaurant_id, Order.status.in_(pending_statuses))
    )
    pending_order_count = len(pending_result.scalars().all())

    return AnalyticsSummary(
        today_revenue=today_revenue,
        today_order_count=len(today_orders),
        average_order_value=average_order_value,
        pending_order_count=pending_order_count,
        low_stock_count=await low_stock_count(db, restaurant_id),
        revenue_series=revenue_series,
        top_items=top_items,
        orders_by_hour=orders_by_hour,
    )
