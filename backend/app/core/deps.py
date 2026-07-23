from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import RoleEnum, User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = await db.get(User, payload.get("sub"))
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    return user


def require_role(*roles: RoleEnum) -> Callable:
    async def _guard(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return user

    return _guard


# Convenience shorthand used across routers. `super_admin` is included in
# every branch-level guard below — they operate any branch in their org via
# the branch-switcher cookie (see get_current_restaurant_for_staff), so they
# need to pass the same role checks a branch's own owner/admin would.
require_owner_admin = require_role(RoleEnum.owner, RoleEnum.admin, RoleEnum.super_admin)
require_menu_managers = require_role(RoleEnum.owner, RoleEnum.admin, RoleEnum.manager, RoleEnum.super_admin)
require_order_staff = require_role(
    RoleEnum.owner,
    RoleEnum.admin,
    RoleEnum.manager,
    RoleEnum.cashier,
    RoleEnum.kitchen,
    RoleEnum.waiter,
    RoleEnum.super_admin,
)
require_billing_staff = require_role(
    RoleEnum.owner, RoleEnum.admin, RoleEnum.manager, RoleEnum.cashier, RoleEnum.super_admin
)

# Phase 3: platform/organization level, above the branch-level roles.
require_platform_owner = require_role(RoleEnum.platform_owner)
require_super_admin = require_role(RoleEnum.super_admin)
