from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.promotions import Coupon, CouponTypeEnum, LoyaltyAccount
from app.schemas.promotions import CouponCreate, CouponUpdate, LoyaltyAdjust

# ── Coupons ──────────────────────────────────────────────────────────────


async def list_coupons(db: AsyncSession, restaurant_id: str) -> list[Coupon]:
    result = await db.execute(
        select(Coupon).where(Coupon.restaurant_id == restaurant_id).order_by(Coupon.created_at.desc())
    )
    return list(result.scalars().all())


async def create_coupon(db: AsyncSession, restaurant_id: str, payload: CouponCreate) -> Coupon:
    existing = await db.execute(
        select(Coupon).where(Coupon.restaurant_id == restaurant_id, Coupon.code == payload.code.upper())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Coupon code already exists")
    coupon = Coupon(restaurant_id=restaurant_id, **{**payload.model_dump(), "code": payload.code.upper()})
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


_BRANCH_OVERRIDABLE_COUPON_FIELDS = {"is_active"}


async def update_coupon(db: AsyncSession, restaurant_id: str, coupon_id: str, payload: CouponUpdate) -> Coupon:
    coupon = await db.get(Coupon, coupon_id)
    if not coupon or coupon.restaurant_id != restaurant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Coupon not found")
    updates = payload.model_dump(exclude_unset=True)
    if coupon.source_global_coupon_id is not None and not set(updates).issubset(_BRANCH_OVERRIDABLE_COUPON_FIELDS):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "This coupon is managed by chain HQ — only availability can be changed here",
        )
    for field, value in updates.items():
        setattr(coupon, field, value)
    await db.commit()
    await db.refresh(coupon)
    return coupon


async def get_valid_coupon(db: AsyncSession, restaurant_id: str, code: str, subtotal: Decimal) -> Coupon:
    result = await db.execute(
        select(Coupon).where(Coupon.restaurant_id == restaurant_id, Coupon.code == code.upper())
    )
    coupon = result.scalar_one_or_none()
    if not coupon or not coupon.is_active:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid coupon code")

    now = datetime.now(timezone.utc)
    if coupon.starts_at and now < coupon.starts_at:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Coupon is not active yet")
    if coupon.expires_at and now > coupon.expires_at:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Coupon has expired")
    if coupon.usage_limit is not None and coupon.times_used >= coupon.usage_limit:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Coupon usage limit reached")
    if subtotal < coupon.min_order_amount:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, f"Order must be at least {coupon.min_order_amount} to use this coupon"
        )
    return coupon


def compute_coupon_discount(coupon: Coupon, subtotal: Decimal, unit_prices: list[Decimal]) -> Decimal:
    """unit_prices: one entry per individual ordered unit (a line with qty 3
    contributes its unit price three times) — needed for a real BOGO calc."""
    if coupon.type == CouponTypeEnum.flat:
        discount = coupon.value
    elif coupon.type == CouponTypeEnum.percentage:
        discount = subtotal * coupon.value / Decimal(100)
        if coupon.max_discount is not None:
            discount = min(discount, coupon.max_discount)
    else:  # bogo — free cheapest unit ordered
        discount = min(unit_prices) if unit_prices else Decimal("0")
    return min(discount, subtotal)


async def mark_coupon_used(db: AsyncSession, coupon: Coupon) -> None:
    coupon.times_used += 1
    await db.commit()


# ── Loyalty ──────────────────────────────────────────────────────────────


async def get_loyalty_account(db: AsyncSession, restaurant_id: str, phone: str) -> LoyaltyAccount | None:
    result = await db.execute(
        select(LoyaltyAccount).where(LoyaltyAccount.restaurant_id == restaurant_id, LoyaltyAccount.phone == phone)
    )
    return result.scalar_one_or_none()


async def get_or_create_loyalty_account(db: AsyncSession, restaurant_id: str, phone: str) -> LoyaltyAccount:
    account = await get_loyalty_account(db, restaurant_id, phone)
    if not account:
        account = LoyaltyAccount(restaurant_id=restaurant_id, phone=phone, points=0)
        db.add(account)
        await db.flush()
    return account


def compute_redeemable_amount(points: int, redeem_rate: Decimal, cap: Decimal) -> tuple[Decimal, int]:
    """Returns (currency_amount, points_actually_spent), capped at `cap`."""
    if points <= 0:
        return Decimal("0"), 0
    max_amount_from_points = Decimal(points) * redeem_rate
    amount = min(max_amount_from_points, cap)
    points_spent = int((amount / redeem_rate).to_integral_value()) if redeem_rate > 0 else 0
    return amount, min(points_spent, points)


async def adjust_loyalty(db: AsyncSession, restaurant_id: str, phone: str, payload: LoyaltyAdjust) -> LoyaltyAccount:
    account = await get_or_create_loyalty_account(db, restaurant_id, phone)
    account.points = max(0, account.points + payload.points_delta)
    if payload.name:
        account.name = payload.name
    await db.commit()
    await db.refresh(account)
    return account
