from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_owner_admin, require_super_admin
from app.core.tenant import get_current_organization_id, get_current_restaurant_for_staff
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.user import StaffCreate, StaffCreateOrgWide, StaffRead, StaffReadWithBranch, StaffUpdate
from app.services.staff import (
    create_staff,
    list_staff_for_branch,
    list_staff_for_organization,
    update_staff,
)

router = APIRouter(prefix="/admin", tags=["admin-staff"], dependencies=[Depends(require_owner_admin)])

org_router = APIRouter(prefix="/admin/org", tags=["admin-staff-org"], dependencies=[Depends(require_super_admin)])


@router.get("/staff", response_model=list[StaffRead])
async def list_branch_staff(
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
    db: AsyncSession = Depends(get_db),
) -> list[User]:
    return await list_staff_for_branch(db, restaurant.id)


@router.post("/staff", response_model=StaffRead)
async def create_branch_staff(
    payload: StaffCreate,
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
    db: AsyncSession = Depends(get_db),
) -> User:
    return await create_staff(
        db, organization_id=restaurant.organization_id, restaurant_id=restaurant.id, payload=payload
    )


@router.patch("/staff/{user_id}", response_model=StaffRead)
async def update_branch_staff(
    user_id: str,
    payload: StaffUpdate,
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    return await update_staff(
        db,
        restaurant_id_scope=restaurant.id,
        user_id=user_id,
        acting_user_id=current_user.id,
        payload=payload,
    )


@org_router.get("/staff", response_model=list[StaffReadWithBranch])
async def list_org_staff(
    organization_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
) -> list[StaffReadWithBranch]:
    pairs = await list_staff_for_organization(db, organization_id)
    return [
        StaffReadWithBranch.model_validate(user, from_attributes=True).model_copy(update={"branch_name": branch_name})
        for user, branch_name in pairs
    ]


@org_router.post("/staff", response_model=StaffRead)
async def create_org_staff(
    payload: StaffCreateOrgWide,
    organization_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
) -> User:
    restaurant = await db.get(Restaurant, payload.restaurant_id)
    if not restaurant or restaurant.organization_id != organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Branch not found")
    return await create_staff(
        db, organization_id=organization_id, restaurant_id=restaurant.id, payload=payload
    )


@org_router.patch("/staff/{user_id}", response_model=StaffRead)
async def update_org_staff(
    user_id: str,
    payload: StaffUpdate,
    organization_id: str = Depends(get_current_organization_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    target = await db.get(User, user_id)
    if not target or target.organization_id != organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Staff member not found")
    return await update_staff(
        db,
        restaurant_id_scope=None,
        user_id=user_id,
        acting_user_id=current_user.id,
        payload=payload,
    )
