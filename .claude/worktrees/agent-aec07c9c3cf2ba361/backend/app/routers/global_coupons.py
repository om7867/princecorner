from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_super_admin
from app.core.tenant import get_current_organization_id
from app.db.session import get_db
from app.schemas.global_coupons import GlobalCouponCreate, GlobalCouponRead, GlobalCouponUpdate
from app.services import global_coupons as global_coupons_service

router = APIRouter(prefix="/admin/org/coupons", tags=["global-coupons"], dependencies=[Depends(require_super_admin)])


@router.get("", response_model=list[GlobalCouponRead])
async def list_global_coupons(
    organization_id: str = Depends(get_current_organization_id), db: AsyncSession = Depends(get_db)
) -> list[GlobalCouponRead]:
    coupons = await global_coupons_service.list_global_coupons(db, organization_id)
    return [GlobalCouponRead.model_validate(c) for c in coupons]


@router.post("", response_model=GlobalCouponRead)
async def create_global_coupon(
    payload: GlobalCouponCreate,
    organization_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
) -> GlobalCouponRead:
    coupon = await global_coupons_service.create_global_coupon(db, organization_id, payload)
    return GlobalCouponRead.model_validate(coupon)


@router.patch("/{coupon_id}", response_model=GlobalCouponRead)
async def update_global_coupon(
    coupon_id: str,
    payload: GlobalCouponUpdate,
    organization_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
) -> GlobalCouponRead:
    coupon = await global_coupons_service.update_global_coupon(db, organization_id, coupon_id, payload)
    return GlobalCouponRead.model_validate(coupon)
