from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_billing_staff, require_menu_managers
from app.core.tenant import get_current_restaurant_for_staff
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.promotions import (
    CouponCreate,
    CouponRead,
    CouponUpdate,
    LoyaltyAccountRead,
    LoyaltyAdjust,
)
from app.services import promotions as promotions_service

router = APIRouter(prefix="/admin", tags=["admin-promotions"])


@router.get("/coupons", response_model=list[CouponRead], dependencies=[Depends(require_menu_managers)])
async def list_coupons(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> list[CouponRead]:
    coupons = await promotions_service.list_coupons(db, restaurant.id)
    return [CouponRead.model_validate(c) for c in coupons]


@router.post("/coupons", response_model=CouponRead, dependencies=[Depends(require_menu_managers)])
async def create_coupon(
    payload: CouponCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> CouponRead:
    coupon = await promotions_service.create_coupon(db, restaurant.id, payload)
    return CouponRead.model_validate(coupon)


@router.patch("/coupons/{coupon_id}", response_model=CouponRead, dependencies=[Depends(require_menu_managers)])
async def update_coupon(
    coupon_id: str,
    payload: CouponUpdate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> CouponRead:
    coupon = await promotions_service.update_coupon(db, restaurant.id, coupon_id, payload)
    return CouponRead.model_validate(coupon)


@router.delete("/coupons/{coupon_id}", dependencies=[Depends(require_menu_managers)])
async def delete_coupon(
    coupon_id: str,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
):
    await promotions_service.delete_coupon(db, restaurant.id, coupon_id)
    return {"status": "deleted"}


@router.get(
    "/loyalty", response_model=list[LoyaltyAccountRead], dependencies=[Depends(require_billing_staff)]
)
async def list_loyalty(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> list[LoyaltyAccountRead]:
    accounts = await promotions_service.list_all_loyalty(db, restaurant.id)
    return [LoyaltyAccountRead.model_validate(a) for a in accounts]


@router.get(
    "/loyalty/{phone}", response_model=LoyaltyAccountRead | None, dependencies=[Depends(require_billing_staff)]
)
async def get_loyalty(
    phone: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> LoyaltyAccountRead | None:
    account = await promotions_service.get_loyalty_account(db, restaurant.id, phone)
    return LoyaltyAccountRead.model_validate(account) if account else None


@router.post(
    "/loyalty/{phone}/adjust", response_model=LoyaltyAccountRead, dependencies=[Depends(require_billing_staff)]
)
async def adjust_loyalty(
    phone: str,
    payload: LoyaltyAdjust,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> LoyaltyAccountRead:
    account = await promotions_service.adjust_loyalty(db, restaurant.id, phone, payload)
    return LoyaltyAccountRead.model_validate(account)


@router.delete(
    "/loyalty/{phone}", dependencies=[Depends(require_billing_staff)]
)
async def delete_loyalty(
    phone: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
):
    await promotions_service.delete_loyalty(db, restaurant.id, phone)
    return {"status": "deleted"}

