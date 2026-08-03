from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.promotions import CouponTypeEnum


class GlobalCouponRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    organization_id: str
    code: str
    type: CouponTypeEnum
    value: Decimal
    min_order_amount: Decimal
    max_discount: Decimal | None
    starts_at: datetime | None
    expires_at: datetime | None
    usage_limit: int | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class GlobalCouponCreate(BaseModel):
    code: str
    type: CouponTypeEnum
    value: Decimal = Decimal("0")
    min_order_amount: Decimal = Decimal("0")
    max_discount: Decimal | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    usage_limit: int | None = None


class GlobalCouponUpdate(BaseModel):
    code: str | None = None
    type: CouponTypeEnum | None = None
    value: Decimal | None = None
    min_order_amount: Decimal | None = None
    max_discount: Decimal | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    usage_limit: int | None = None
    is_active: bool | None = None
