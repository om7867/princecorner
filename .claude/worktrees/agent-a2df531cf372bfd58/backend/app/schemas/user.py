from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

# Staff Management only ever creates/edits branch-level accounts. owner is the
# founding branch account (seeded, never created here) and
# super_admin/platform_owner are organization/platform level — none of those
# are assignable through this surface.
ASSIGNABLE_ROLES = {"admin", "manager", "cashier", "kitchen", "waiter"}


def _validate_role(role: str) -> str:
    if role not in ASSIGNABLE_ROLES:
        raise ValueError(f"role must be one of {sorted(ASSIGNABLE_ROLES)}")
    return role


class StaffRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    role: str
    restaurant_id: str | None
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None


class StaffReadWithBranch(StaffRead):
    branch_name: str | None = None


class StaffCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

    @field_validator("role")
    @classmethod
    def role_is_assignable(cls, value: str) -> str:
        return _validate_role(value)


class StaffCreateOrgWide(StaffCreate):
    """Org-wide create (super_admin) additionally names which branch the new
    staff account belongs to — the branch-scoped route infers this from the
    caller's resolved restaurant instead."""

    restaurant_id: str


class StaffUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    is_active: bool | None = None
    password: str | None = None

    @field_validator("role")
    @classmethod
    def role_is_assignable(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return _validate_role(value)
