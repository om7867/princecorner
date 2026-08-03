from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.organization import OrganizationPlanEnum, OrganizationStatusEnum


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    status: OrganizationStatusEnum
    plan: OrganizationPlanEnum
    access_ends_at: datetime | None
    created_at: datetime
    branch_count: int = 0


class OrganizationCreate(BaseModel):
    """Platform Owner creates a new tenant: the organization, its first
    branch, and the super_admin login that manages it — all in one call."""

    org_name: str
    org_slug: str
    branch_name: str
    branch_slug: str
    super_admin_name: str
    super_admin_email: EmailStr
    super_admin_password: str


class OrganizationStatusUpdate(BaseModel):
    """Platform Owner PATCH — both fields optional so status and plan can be
    updated independently or together ("Manage Subscription" is the `plan`
    field; no payment processor behind it, see Phase 4 plan)."""

    status: OrganizationStatusEnum | None = None
    plan: OrganizationPlanEnum | None = None
    access_ends_at: datetime | None = None


class OrganizationBrandingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    brand_logo_url: str | None
    brand_primary_color: str | None
    brand_accent_color: str | None


class OrganizationBrandingUpdate(BaseModel):
    brand_logo_url: str | None = None
    brand_primary_color: str | None = None
    brand_accent_color: str | None = None


class BranchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    is_active: bool
    created_at: datetime


class BranchCreate(BaseModel):
    name: str
    slug: str


class BranchUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    is_active: bool | None = None


class SelectBranch(BaseModel):
    branch_id: str
