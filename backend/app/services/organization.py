from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.models.restaurant import Restaurant
from app.models.site_settings import SiteSettings
from app.schemas.organization import BranchCreate, OrganizationBrandingUpdate


async def create_branch(db: AsyncSession, organization_id: str, payload: BranchCreate) -> Restaurant:
    """Creates a new Restaurant (branch) under an organization, plus the
    SiteSettings row every restaurant is assumed to have (settings/billing
    lookups elsewhere use `.scalar_one()`, not `_or_none()`). Shared by the
    Platform Owner's "create organization" flow (first branch) and the Super
    Admin's "add branch" flow — keep both call sites going through this.

    New branches inherit the org's brand defaults (logo/colors) into their
    own SiteSettings row — Branch Admin can still freely override them
    afterward, this is just the starting point ("Website Builder")."""
    restaurant = Restaurant(organization_id=organization_id, slug=payload.slug, name=payload.name)
    db.add(restaurant)
    await db.flush()

    org = await db.get(Organization, organization_id)
    db.add(
        SiteSettings(
            restaurant_id=restaurant.id,
            logo_url=org.brand_logo_url if org else None,
            primary_color=org.brand_primary_color if org else None,
            accent_color=org.brand_accent_color if org else None,
        )
    )
    await db.commit()
    await db.refresh(restaurant)
    return restaurant


async def count_branches(db: AsyncSession, organization_id: str) -> int:
    result = await db.execute(select(Restaurant).where(Restaurant.organization_id == organization_id))
    return len(result.scalars().all())


async def count_active_branches(db: AsyncSession, organization_id: str) -> int:
    result = await db.execute(
        select(Restaurant).where(Restaurant.organization_id == organization_id, Restaurant.is_active.is_(True))
    )
    return len(result.scalars().all())


async def get_branding(db: AsyncSession, organization_id: str) -> Organization:
    org = await db.get(Organization, organization_id)
    if not org:
        raise LookupError("Organization not found")
    return org


async def update_branding(db: AsyncSession, organization_id: str, payload: OrganizationBrandingUpdate) -> Organization:
    org = await db.get(Organization, organization_id)
    if not org:
        raise LookupError("Organization not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    await db.commit()
    await db.refresh(org)
    return org


async def push_branding_to_branches(db: AsyncSession, organization_id: str) -> int:
    """Resets every active branch's SiteSettings logo/colors back to the
    org's current brand defaults — the "push to all branches" action."""
    org = await db.get(Organization, organization_id)
    if not org:
        raise LookupError("Organization not found")

    result = await db.execute(
        select(Restaurant).where(Restaurant.organization_id == organization_id, Restaurant.is_active.is_(True))
    )
    branches = result.scalars().all()

    updated = 0
    for branch in branches:
        settings_result = await db.execute(select(SiteSettings).where(SiteSettings.restaurant_id == branch.id))
        site_settings = settings_result.scalar_one_or_none()
        if not site_settings:
            continue
        site_settings.logo_url = org.brand_logo_url
        site_settings.primary_color = org.brand_primary_color
        site_settings.accent_color = org.brand_accent_color
        updated += 1

    await db.commit()
    return updated
