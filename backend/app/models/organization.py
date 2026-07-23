import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, new_uuid


class OrganizationStatusEnum(str, enum.Enum):
    trial = "trial"
    active = "active"
    suspended = "suspended"


class OrganizationPlanEnum(str, enum.Enum):
    trial = "trial"
    starter = "starter"
    pro = "pro"
    enterprise = "enterprise"


class Organization(Base):
    """A SaaS tenant — one row per restaurant chain that signs up. Owns one
    or more `Restaurant` rows (branches). Not present for single-branch
    setups seeded before this phase until backfilled by migration."""

    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    status: Mapped[OrganizationStatusEnum] = mapped_column(
        Enum(OrganizationStatusEnum, native_enum=False, length=20), default=OrganizationStatusEnum.trial
    )
    # Scheduled closure ("services end by that date"): access works normally
    # until this instant, then login is rejected — checked lazily at login
    # time in auth.py, no background scheduler needed.
    access_ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # Informational billing tier only — no payment processor wired up. Platform
    # Owner sets this manually; it's a real field, not a placeholder.
    plan: Mapped[OrganizationPlanEnum] = mapped_column(
        Enum(OrganizationPlanEnum, native_enum=False, length=20), default=OrganizationPlanEnum.trial
    )

    # Brand defaults ("Website Builder"): Super Admin edits these; new
    # branches inherit them into their own SiteSettings row at creation, and
    # a "push to all branches" action can reset any branch back to standard.
    # Branch-level SiteSettings still take precedence once locally edited.
    brand_logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    brand_primary_color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    brand_accent_color: Mapped[str | None] = mapped_column(String(20), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
