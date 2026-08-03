from fastapi import Cookie, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.user import RoleEnum, User

DEFAULT_RESTAURANT_SLUG = "default"

SELECTED_BRANCH_COOKIE = "selected_branch_id"


async def get_current_restaurant_for_staff(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    selected_branch_id: str | None = Cookie(default=None, alias=SELECTED_BRANCH_COOKIE),
) -> Restaurant:
    """Branch resolution for every `/admin/*` route. Returns the branch selected
    via cookie, user's assigned restaurant, or defaults to prince-corner-isanpur."""
    if user.role == RoleEnum.platform_owner:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Platform owners don't operate on a branch")

    # 1. If caller selected a branch via the branch-switcher UI:
    if selected_branch_id:
        restaurant = await db.get(Restaurant, selected_branch_id)
        if restaurant and restaurant.is_active:
            return restaurant

    # 2. If user has an assigned branch:
    if user.restaurant_id:
        restaurant = await db.get(Restaurant, user.restaurant_id)
        if restaurant and restaurant.is_active:
            return restaurant

    # 3. Default fallback to Prince Corner - Isanpur:
    result = await db.execute(select(Restaurant).where(Restaurant.slug == "prince-corner-isanpur"))
    restaurant = result.scalar_one_or_none()
    if restaurant:
        return restaurant

    result = await db.execute(select(Restaurant).order_by(Restaurant.created_at))
    restaurant = result.scalars().first()
    if not restaurant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No active branches yet — create one first")
    return restaurant


async def get_current_organization_id(user: User = Depends(get_current_user)) -> str:
    """For org-wide endpoints (staff across branches, global menu/coupons,
    inventory transfers) that operate on the whole organization rather than
    one selected branch. Any role with an `organization_id` may use it —
    `platform_owner` has none and is rejected."""
    if not user.organization_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has no organization")
    return user.organization_id


async def get_current_restaurant_public(
    restaurant: str | None = Query(
        default=None, description="Branch slug — identifies which restaurant this guest request is for"
    ),
    db: AsyncSession = Depends(get_db),
) -> Restaurant:
    """Branch resolution for every guest-facing route (menu, orders,
    reservations, invoices, ws). There's no JWT for guests, so the branch is
    named explicitly by slug — table QR codes encode it alongside the table
    code (see QRGrid.tsx / OrderApp.tsx). Optional with a fallback (first
    restaurant / the pre-Phase-3 default slug) so marketing-site pages that
    don't yet pass a branch — home, /menu, /restaurant, /cafe, etc. — keep
    working exactly as before this phase."""
    if restaurant:
        result = await db.execute(select(Restaurant).where(Restaurant.slug == restaurant))
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown restaurant")
        return row

    result = await db.execute(select(Restaurant).where(Restaurant.slug == DEFAULT_RESTAURANT_SLUG))
    row = result.scalar_one_or_none()
    if row:
        return row
    result = await db.execute(select(Restaurant).order_by(Restaurant.created_at))
    row = result.scalars().first()
    if not row:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "No restaurant seeded — run `python -m app.seed`")
    return row
