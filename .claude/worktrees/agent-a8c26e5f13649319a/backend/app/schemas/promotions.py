from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.promotions import CouponTypeEnum


class CouponRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    code: str
    type: CouponTypeEnum
    value: Decimal
    min_order_amount: Decimal
    max_discount: Decimal | None
    starts_at: datetime | None
    expires_at: datetime | None
    usage_limit: int | None
    times_used: int
    is_active: bool
    source_global_coupon_id: str | None = None


class CouponCreate(BaseModel):
    code: str
    type: CouponTypeEnum
    value: Decimal = Decimal("0")
    min_order_amount: Decimal = Decimal("0")
    max_discount: Decimal | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    usage_limit: int | None = None


class CouponUpdate(BaseModel):
    value: Decimal | None = None
    min_order_amount: Decimal | None = None
    max_discount: Decimal | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    usage_limit: int | None = None
    is_active: bool | None = None


class LoyaltyAccountRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    phone: str
    name: str | None
    points: int
    created_at: datetime


class LoyaltyAdjust(BaseModel):
    points_delta: int
    name: str | None = None
