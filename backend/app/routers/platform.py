from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_platform_owner
from app.core.security import hash_password
from app.db.session import get_db
from app.models.organization import Organization, OrganizationStatusEnum
from app.models.user import RoleEnum, User
from app.schemas.organization import BranchCreate, OrganizationCreate, OrganizationRead, OrganizationStatusUpdate
from app.services.organization import count_branches, create_branch

router = APIRouter(prefix="/platform", tags=["platform"], dependencies=[Depends(require_platform_owner)])


@router.get("/organizations", response_model=list[OrganizationRead])
async def list_organizations(db: AsyncSession = Depends(get_db)) -> list[OrganizationRead]:
    result = await db.execute(select(Organization))
    organizations = result.scalars().all()

    reads: list[OrganizationRead] = []
    for org in organizations:
        read = OrganizationRead.model_validate(org, from_attributes=True)
        read.branch_count = await count_branches(db, org.id)
        reads.append(read)
    return reads


@router.post("/organizations", response_model=OrganizationRead)
async def create_organization(payload: OrganizationCreate, db: AsyncSession = Depends(get_db)) -> OrganizationRead:
    # Org slug must be unique across tenants.
    existing_org = await db.execute(select(Organization).where(Organization.slug == payload.org_slug))
    if existing_org.scalar_one_or_none() is not None:
        raise HTTPException(409, "Organization slug already in use")

    # Super admin email must be unique across all users.
    existing_user = await db.execute(select(User).where(User.email == payload.super_admin_email.lower()))
    if existing_user.scalar_one_or_none() is not None:
        raise HTTPException(409, "Email already in use")

    org = Organization(name=payload.org_name, slug=payload.org_slug, status=OrganizationStatusEnum.active)
    db.add(org)
    await db.flush()  # need org.id before creating the branch/user

    await create_branch(db, org.id, BranchCreate(name=payload.branch_name, slug=payload.branch_slug))

    super_admin = User(
        organization_id=org.id,
        restaurant_id=None,
        role=RoleEnum.super_admin,
        name=payload.super_admin_name,
        email=payload.super_admin_email.lower(),
        password_hash=hash_password(payload.super_admin_password),
    )
    db.add(super_admin)
    await db.commit()
    await db.refresh(org)

    read = OrganizationRead.model_validate(org, from_attributes=True)
    read.branch_count = 1
    return read


@router.patch("/organizations/{org_id}", response_model=OrganizationRead)
async def update_organization_status(
    org_id: str, payload: OrganizationStatusUpdate, db: AsyncSession = Depends(get_db)
) -> OrganizationRead:
    org = await db.get(Organization, org_id)
    if org is None:
        raise HTTPException(404, "Organization not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(org, field, value)
    await db.commit()
    await db.refresh(org)

    read = OrganizationRead.model_validate(org, from_attributes=True)
    read.branch_count = await count_branches(db, org.id)
    return read
