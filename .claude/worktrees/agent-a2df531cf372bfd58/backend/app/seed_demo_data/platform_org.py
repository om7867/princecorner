"""Demo data for the Platform Owner's dashboard (`/platform`,
`GET /platform/organizations`), which otherwise only lists 2 organizations
("Default Organization" = the real user's own restaurant — NEVER touch it —
and "Demo Bistro Group" = the first demo chain from `app/seed.py`). This
module adds two more demo organizations plus rounds out Demo Bistro Group so
the platform tier has something realistic to demo:

1. "Trial Bites Co" (`trial-bites-co`) — a `trial`-status org with 1 branch
   and a super_admin login, showing what a brand-new signup looks like.
2. "Closed Kitchen Group" (`closed-kitchen-group`) — an `active`-status org
   whose `access_ends_at` is set 7 days in the future, so the Platform
   dashboard's "Closes on <date>" badge has something to show without the
   login actually being blocked yet (that only happens once the date passes
   — checked lazily in `app/routers/auth.py::login`).
3. A 3rd branch ("Demo Riverside") for the existing "Demo Bistro Group" org.
4. `RestaurantTable` rows (`T1`-`T6`) for every active Demo Bistro Group
   branch that doesn't have any yet — needed for the QR-code / guest
   ordering demo.
5. Brand colors/logo on the Demo Bistro Group `Organization` row, so the
   Branding admin page isn't empty on first load.

Every piece here is independently idempotent (checked by slug/email before
inserting, same style as `app/seed.py`) — safe to call `seed()` any number of
times without duplicating rows or hitting unique-constraint errors. Never
touches `Organization.slug == "default-org"` or `Restaurant.slug ==
"default"` — that's the real user's own data.

Run with (from backend/, venv active):
    python -m app.seed_demo_data.platform_org
"""

import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.organization import Organization, OrganizationStatusEnum
from app.models.restaurant import Restaurant
from app.models.table import RestaurantTable
from app.models.user import RoleEnum, User
from app.schemas.organization import BranchCreate
from app.services.organization import create_branch

DEMO_BISTRO_ORG_SLUG = "demo-bistro-group"

TRIAL_ORG_SLUG = "trial-bites-co"
TRIAL_SUPER_ADMIN_EMAIL = "demo.trialowner@example.com"
TRIAL_SUPER_ADMIN_PASSWORD = "DemoPass123!"  # nosec - dev-only default

CLOSED_ORG_SLUG = "closed-kitchen-group"
CLOSED_SUPER_ADMIN_EMAIL = "demo.closedowner@example.com"
CLOSED_SUPER_ADMIN_PASSWORD = "DemoPass123!"  # nosec - dev-only default

DEMO_RIVERSIDE_SLUG = "demo-riverside"

TABLE_CODES = [f"T{i}" for i in range(1, 7)]  # T1..T6

DEMO_BRAND_LOGO_URL = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80&auto=format&fit=crop"
DEMO_BRAND_PRIMARY_COLOR = "#e7a73a"
DEMO_BRAND_ACCENT_COLOR = "#6b7a4f"


async def seed_trial_bites_co(db: AsyncSession) -> None:
    """Independently idempotent — a `trial`-status demo org with 1 branch and
    1 super_admin login, showing a brand-new signup on the Platform dashboard."""
    existing = await db.execute(select(Organization).where(Organization.slug == TRIAL_ORG_SLUG))
    if existing.scalar_one_or_none():
        print("Trial Bites Co already seeded — nothing to do.")
        return

    org = Organization(name="Trial Bites Co", slug=TRIAL_ORG_SLUG, status=OrganizationStatusEnum.trial)
    db.add(org)
    await db.flush()

    await create_branch(db, org.id, BranchCreate(name="Trial Bites Downtown", slug="trial-bites-downtown"))

    db.add(
        User(
            organization_id=org.id,
            restaurant_id=None,
            name="Trial Bites Owner",
            email=TRIAL_SUPER_ADMIN_EMAIL,
            password_hash=hash_password(TRIAL_SUPER_ADMIN_PASSWORD),
            role=RoleEnum.super_admin,
        )
    )
    await db.commit()

    print(
        "Seeded: demo organization 'Trial Bites Co' (trial status) with 1 branch, "
        f"1 super_admin ({TRIAL_SUPER_ADMIN_EMAIL} / {TRIAL_SUPER_ADMIN_PASSWORD})"
    )
    print("Dev-only credentials — change immediately before any real deployment.")


async def seed_closed_kitchen_group(db: AsyncSession) -> None:
    """Independently idempotent — an `active`-status demo org with
    `access_ends_at` set 7 days in the future (from whenever this seed first
    runs), so the Platform dashboard's "Closes on <date>" badge has something
    to show without the login being blocked yet."""
    existing = await db.execute(select(Organization).where(Organization.slug == CLOSED_ORG_SLUG))
    if existing.scalar_one_or_none():
        print("Closed Kitchen Group already seeded — nothing to do.")
        return

    access_ends_at = datetime.now(timezone.utc) + timedelta(days=7)

    org = Organization(
        name="Closed Kitchen Group",
        slug=CLOSED_ORG_SLUG,
        status=OrganizationStatusEnum.active,
        access_ends_at=access_ends_at,
    )
    db.add(org)
    await db.flush()

    await create_branch(db, org.id, BranchCreate(name="Closed Kitchen Downtown", slug="closed-kitchen-downtown"))

    db.add(
        User(
            organization_id=org.id,
            restaurant_id=None,
            name="Closed Kitchen Owner",
            email=CLOSED_SUPER_ADMIN_EMAIL,
            password_hash=hash_password(CLOSED_SUPER_ADMIN_PASSWORD),
            role=RoleEnum.super_admin,
        )
    )
    await db.commit()

    print(
        "Seeded: demo organization 'Closed Kitchen Group' (active status) with 1 branch, "
        f"access_ends_at={access_ends_at.isoformat()} (7 days out), "
        f"1 super_admin ({CLOSED_SUPER_ADMIN_EMAIL} / {CLOSED_SUPER_ADMIN_PASSWORD})"
    )
    print("Dev-only credentials — change immediately before any real deployment.")


async def seed_demo_bistro_third_branch(db: AsyncSession) -> None:
    """Independently idempotent — adds a 3rd branch ("Demo Riverside") to the
    existing 'Demo Bistro Group' organization, if it doesn't already exist.
    No-ops (with a message) if that organization hasn't been seeded yet."""
    org_result = await db.execute(select(Organization).where(Organization.slug == DEMO_BISTRO_ORG_SLUG))
    org = org_result.scalar_one_or_none()
    if not org:
        print(f"Organization '{DEMO_BISTRO_ORG_SLUG}' not found — skipping 3rd branch seed.")
        return

    existing_branch = await db.execute(select(Restaurant).where(Restaurant.slug == DEMO_RIVERSIDE_SLUG))
    if existing_branch.scalar_one_or_none():
        print("Demo Riverside branch already seeded — nothing to do.")
        return

    await create_branch(db, org.id, BranchCreate(name="Demo Riverside", slug=DEMO_RIVERSIDE_SLUG))
    print("Seeded: 3rd branch 'Demo Riverside' for Demo Bistro Group.")


async def seed_demo_bistro_tables(db: AsyncSession) -> None:
    """Independently idempotent — creates T1-T6 `RestaurantTable` rows for
    every active Demo Bistro Group branch that has zero tables yet (needed
    for the QR-code / guest-ordering demo). Branches that already have any
    tables are left untouched."""
    org_result = await db.execute(select(Organization).where(Organization.slug == DEMO_BISTRO_ORG_SLUG))
    org = org_result.scalar_one_or_none()
    if not org:
        print(f"Organization '{DEMO_BISTRO_ORG_SLUG}' not found — skipping table seed.")
        return

    branches_result = await db.execute(
        select(Restaurant).where(Restaurant.organization_id == org.id, Restaurant.is_active.is_(True))
    )
    branches = list(branches_result.scalars().all())

    seeded_branches: list[str] = []
    for branch in branches:
        table_count_result = await db.execute(
            select(RestaurantTable.id).where(RestaurantTable.restaurant_id == branch.id).limit(1)
        )
        if table_count_result.scalar_one_or_none():
            continue  # branch already has tables — leave it alone

        for code in TABLE_CODES:
            db.add(RestaurantTable(restaurant_id=branch.id, code=code))
        seeded_branches.append(branch.slug)

    if seeded_branches:
        await db.commit()
        print(f"Seeded: {len(TABLE_CODES)} tables ({', '.join(TABLE_CODES)}) each for branches: {', '.join(seeded_branches)}")
    else:
        print("All active Demo Bistro Group branches already have tables — nothing to do.")


async def seed_demo_bistro_branding(db: AsyncSession) -> None:
    """Independently idempotent — sets brand_logo_url/brand_primary_color/
    brand_accent_color on the Demo Bistro Group Organization row if they're
    currently null, so the Branding admin page isn't empty on first load."""
    org_result = await db.execute(select(Organization).where(Organization.slug == DEMO_BISTRO_ORG_SLUG))
    org = org_result.scalar_one_or_none()
    if not org:
        print(f"Organization '{DEMO_BISTRO_ORG_SLUG}' not found — skipping branding seed.")
        return

    if org.brand_logo_url or org.brand_primary_color or org.brand_accent_color:
        print("Demo Bistro Group branding already set — nothing to do.")
        return

    org.brand_logo_url = DEMO_BRAND_LOGO_URL
    org.brand_primary_color = DEMO_BRAND_PRIMARY_COLOR
    org.brand_accent_color = DEMO_BRAND_ACCENT_COLOR
    await db.commit()

    print(
        f"Seeded: Demo Bistro Group branding (logo={DEMO_BRAND_LOGO_URL}, "
        f"primary={DEMO_BRAND_PRIMARY_COLOR}, accent={DEMO_BRAND_ACCENT_COLOR})"
    )


async def seed(db: AsyncSession) -> None:
    """Orchestrates every piece of platform-tier demo data above. Each step
    is independently idempotent, so calling `seed()` any number of times is
    safe — never touches `Organization.slug == "default-org"` or
    `Restaurant.slug == "default"` (the real user's own data)."""
    await seed_trial_bites_co(db)
    await seed_closed_kitchen_group(db)
    await seed_demo_bistro_third_branch(db)
    await seed_demo_bistro_tables(db)
    await seed_demo_bistro_branding(db)


async def _main() -> None:
    async with AsyncSessionLocal() as db:
        await seed(db)


if __name__ == "__main__":
    asyncio.run(_main())
