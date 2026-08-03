from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.promotions import Coupon, GlobalCoupon
from app.models.restaurant import Restaurant
from app.schemas.global_coupons import GlobalCouponCreate, GlobalCouponUpdate


async def list_global_coupons(db: AsyncSession, organization_id: str) -> list[GlobalCoupon]:
    result = await db.execute(
        select(GlobalCoupon)
        .where(GlobalCoupon.organization_id == organization_id)
        .order_by(GlobalCoupon.created_at.desc())
    )
    return list(result.scalars().all())


async def _get_global_coupon_or_404(db: AsyncSession, organization_id: str, coupon_id: str) -> GlobalCoupon:
    coupon = await db.get(GlobalCoupon, coupon_id)
    if not coupon or coupon.organization_id != organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Global coupon not found")
    return coupon


async def create_global_coupon(db: AsyncSession, organization_id: str, payload: GlobalCouponCreate) -> GlobalCoupon:
    coupon = GlobalCoupon(
        organization_id=organization_id, **{**payload.model_dump(), "code": payload.code.upper()}
    )
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    await push_global_coupon(db, coupon)
    return coupon


async def update_global_coupon(
    db: AsyncSession, organization_id: str, coupon_id: str, payload: GlobalCouponUpdate
) -> GlobalCoupon:
    coupon = await _get_global_coupon_or_404(db, organization_id, coupon_id)
    updates = payload.model_dump(exclude_unset=True)
    if updates.get("code"):
        updates["code"] = updates["code"].upper()
    for field, value in updates.items():
        setattr(coupon, field, value)
    await db.commit()
    await db.refresh(coupon)
    await push_global_coupon(db, coupon)
    return coupon


async def push_global_coupon(db: AsyncSession, coupon: GlobalCoupon) -> tuple[int, list[str]]:
    """Pushes/updates the branch-level `Coupon` row (tagged via
    `source_global_coupon_id`) in every active branch of the org. Re-push
    syncs every field EXCEPT `is_active` — a branch admin's local "disable
    this chain coupon here" is a legitimate override the next HQ edit must
    not silently re-enable. Coupon codes are unique per (restaurant_id,
    code); if a branch already has a different, non-global coupon using the
    same code, that branch is skipped (not crashed) and its name collected.

    Returns (branches_touched, skipped_branch_names)."""
    result = await db.execute(
        select(Restaurant).where(Restaurant.organization_id == coupon.organization_id, Restaurant.is_active.is_(True))
    )
    branches = result.scalars().all()

    touched = 0
    skipped: list[str] = []
    for branch in branches:
        existing_result = await db.execute(
            select(Coupon).where(Coupon.restaurant_id == branch.id, Coupon.source_global_coupon_id == coupon.id)
        )
        branch_coupon = existing_result.scalar_one_or_none()

        if branch_coupon:
            branch_coupon.code = coupon.code
            branch_coupon.type = coupon.type
            branch_coupon.value = coupon.value
            branch_coupon.min_order_amount = coupon.min_order_amount
            branch_coupon.max_discount = coupon.max_discount
            branch_coupon.starts_at = coupon.starts_at
            branch_coupon.expires_at = coupon.expires_at
            branch_coupon.usage_limit = coupon.usage_limit
            touched += 1
            continue

        conflict_result = await db.execute(
            select(Coupon).where(Coupon.restaurant_id == branch.id, Coupon.code == coupon.code)
        )
        if conflict_result.scalar_one_or_none():
            skipped.append(branch.name)
            continue

        db.add(
            Coupon(
                restaurant_id=branch.id,
                source_global_coupon_id=coupon.id,
                code=coupon.code,
                type=coupon.type,
                value=coupon.value,
                min_order_amount=coupon.min_order_amount,
                max_discount=coupon.max_discount,
                starts_at=coupon.starts_at,
                expires_at=coupon.expires_at,
                usage_limit=coupon.usage_limit,
                is_active=coupon.is_active,
            )
        )
        touched += 1

    await db.commit()
    return touched, skipped
