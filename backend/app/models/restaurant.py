from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, new_uuid


class Restaurant(Base):
    """One branch/location. Owned by an `Organization` (a SaaS tenant/chain)
    — `organization_id` is nullable only to support the pre-Phase-3 single-
    tenant seed; every restaurant created from Phase 3 onward has one."""

    __tablename__ = "restaurants"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    organization_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    # "Delete Branch" archives rather than destroys — order/payment history
    # would otherwise cascade-delete. Archived branches are hidden from the
    # branch switcher, branch lists, and org analytics, never removed.
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
