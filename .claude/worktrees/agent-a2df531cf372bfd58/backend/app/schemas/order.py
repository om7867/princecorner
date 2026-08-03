from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderChannelEnum, OrderStatusEnum


class OrderLineAddonIn(BaseModel):
    addon_id: str


class OrderLineIn(BaseModel):
    menu_item_id: str
    variant_id: str | None = None
    quantity: int = Field(ge=1, le=20)
    addon_ids: list[str] = []


class OrderCreate(BaseModel):
    table: str
    note: str = ""
    lines: list[OrderLineIn]
    channel: OrderChannelEnum = OrderChannelEnum.dine_in


class OrderItemAddonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name_snapshot: str
    price_snapshot: Decimal


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name_snapshot: str
    unit_price_snapshot: Decimal
    quantity: int
    line_total: Decimal
    addons: list[OrderItemAddonRead] = []


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    display_code: str
    status: OrderStatusEnum
    channel: OrderChannelEnum
    note: str
    subtotal: Decimal
    total: Decimal
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemRead] = []
    table_code: str = ""
    is_billed: bool = False


class OrderStatusUpdate(BaseModel):
    status: OrderStatusEnum
