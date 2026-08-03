from decimal import Decimal

from pydantic import BaseModel


class DailyRevenuePoint(BaseModel):
    date: str
    revenue: Decimal
    order_count: int


class TopItem(BaseModel):
    name: str
    quantity: int
    revenue: Decimal


class HourlyOrders(BaseModel):
    hour: int
    order_count: int


class AnalyticsSummary(BaseModel):
    today_revenue: Decimal
    today_order_count: int
    average_order_value: Decimal
    pending_order_count: int
    low_stock_count: int
    revenue_series: list[DailyRevenuePoint]
    top_items: list[TopItem]
    orders_by_hour: list[HourlyOrders]
