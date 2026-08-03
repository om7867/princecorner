from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.restaurant import Restaurant
from app.models.user import RoleEnum, User
from app.schemas.user import ASSIGNABLE_ROLES, StaffCreate, StaffUpdate


async def list_staff_for_branch(db: AsyncSession, restaurant_id: str) -> list[User]:
    result = await db.execute(select(User).where(User.restaurant_id == restaurant_id).order_by(User.created_at))
    return list(result.scalars().all())


async def list_staff_for_organization(db: AsyncSession, organization_id: str) -> list[tuple[User, str]]:
    """Branch staff across the whole org — deliberately excludes rows with no
    `restaurant_id` (the org's own super_admin accounts and any platform_owner
    rows), since this endpoint lists branch staff, not org-level accounts.
    No filter on `Restaurant.is_active` — an archived branch's staff should
    still show up here so Super Admin can see/reassign them."""
    result = await db.execute(
        select(User, Restaurant.name)
        .join(Restaurant, Restaurant.id == User.restaurant_id)
        .where(User.organization_id == organization_id, User.restaurant_id.is_not(None))
        .order_by(User.created_at)
    )
    return [(user, branch_name) for user, branch_name in result.all()]


async def create_staff(
    db: AsyncSession, *, organization_id: str, restaurant_id: str, payload: StaffCreate
) -> User:
    if payload.role not in ASSIGNABLE_ROLES:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"role must be one of {sorted(ASSIGNABLE_ROLES)}")

    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already in use")

    user = User(
        organization_id=organization_id,
        restaurant_id=restaurant_id,
        role=RoleEnum(payload.role),
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_staff(
    db: AsyncSession,
    *,
    restaurant_id_scope: str | None,
    user_id: str,
    acting_user_id: str,
    payload: StaffUpdate,
) -> User:
    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Staff member not found")

    if restaurant_id_scope is not None and target.restaurant_id != restaurant_id_scope:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Staff member not found")

    if target.role == RoleEnum.owner:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "The branch owner account can't be edited here")

    updates = payload.model_dump(exclude_unset=True)

    if user_id == acting_user_id and (updates.get("is_active") is False or "role" in updates):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can't change your own role or deactivate yourself")

    if "role" in updates and updates["role"] is not None and updates["role"] not in ASSIGNABLE_ROLES:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"role must be one of {sorted(ASSIGNABLE_ROLES)}")

    if "password" in updates:
        password = updates.pop("password")
        if password:
            target.password_hash = hash_password(password)
    if "role" in updates and updates["role"] is not None:
        updates["role"] = RoleEnum(updates["role"])

    for field, value in updates.items():
        setattr(target, field, value)

    await db.commit()
    await db.refresh(target)
    return target
