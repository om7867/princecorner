import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, new_uuid


class CouponTypeEnum(str, enum.Enum):
    flat = "flat"
    percentage = "percentage"
    bogo = "bogo"


class Coupon(Base):
    __tablename__ = "coupons"
    __table_args__ = (UniqueConstraint("restaurant_id", "code", name="uq_coupon_code_per_restaurant"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    # Set when this row was pushed from a Super Admin's Global Coupon
    # template. The branch-level update endpoint uses this to reject edits
    # to protected fields (code/type/value) on anything global-sourced.
    source_global_coupon_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("global_coupons.id", ondelete="SET NULL"), nullable=True, index=True
    )
    code: Mapped[str] = mapped_column(String(40))
    type: Mapped[CouponTypeEnum] = mapped_column(Enum(CouponTypeEnum, native_enum=False, length=20))
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)  # flat amount or percent (ignored for bogo)
    min_order_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    max_discount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # caps percentage type

    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    times_used: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class GlobalCoupon(Base):
    """A Super Admin's org-wide master coupon. Saving one pushes/updates a
    real `Coupon` row (tagged via `source_global_coupon_id`) in every active
    branch of the organization — see `services/global_coupons.py`."""

    __tablename__ = "global_coupons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    organization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    code: Mapped[str] = mapped_column(String(40))
    type: Mapped[CouponTypeEnum] = mapped_column(Enum(CouponTypeEnum, native_enum=False, length=20))
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    min_order_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    max_discount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class LoyaltyAccount(Base):
    """Guests have no real account system in this phase, so phone number is
    the only identity we have — the same pattern reservations already use."""

    __tablename__ = "loyalty_accounts"
    __table_args__ = (UniqueConstraint("restaurant_id", "phone", name="uq_loyalty_phone_per_restaurant"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    phone: Mapped[str] = mapped_column(String(40))
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
