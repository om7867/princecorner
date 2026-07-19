from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_billing_staff, require_menu_managers
from app.core.tenant import get_current_restaurant
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
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> list[CouponRead]:
    coupons = await promotions_service.list_coupons(db, restaurant.id)
    return [CouponRead.model_validate(c) for c in coupons]


@router.post("/coupons", response_model=CouponRead, dependencies=[Depends(require_menu_managers)])
async def create_coupon(
    payload: CouponCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> CouponRead:
    coupon = await promotions_service.create_coupon(db, restaurant.id, payload)
    return CouponRead.model_validate(coupon)


@router.patch("/coupons/{coupon_id}", response_model=CouponRead, dependencies=[Depends(require_menu_managers)])
async def update_coupon(
    coupon_id: str,
    payload: CouponUpdate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> CouponRead:
    coupon = await promotions_service.update_coupon(db, restaurant.id, coupon_id, payload)
    return CouponRead.model_validate(coupon)


@router.get(
    "/loyalty/{phone}", response_model=LoyaltyAccountRead | None, dependencies=[Depends(require_billing_staff)]
)
async def get_loyalty(
    phone: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
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
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> LoyaltyAccountRead:
    account = await promotions_service.adjust_loyalty(db, restaurant.id, phone, payload)
    return LoyaltyAccountRead.model_validate(account)
