from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, new_uuid


class SiteSettings(Base):
    """The restaurant's editable identity/branding + CMS-basics surface.

    One row per restaurant. Every field here is what an owner edits from
    Admin > Settings to rebrand/configure the public site — nothing about
    the restaurant's identity should ever be hardcoded in the frontend.
    """

    __tablename__ = "site_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), unique=True
    )

    tagline: Mapped[str | None] = mapped_column(String(300), nullable=True)
    description: Mapped[str | None] = mapped_column(String(2000), nullable=True)

    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    favicon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    primary_color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    accent_color: Mapped[str | None] = mapped_column(String(20), nullable=True)

    address_street: Mapped[str | None] = mapped_column(String(200), nullable=True)
    address_area: Mapped[str | None] = mapped_column(String(200), nullable=True)
    address_city: Mapped[str | None] = mapped_column(String(200), nullable=True)
    maps_query: Mapped[str | None] = mapped_column(String(300), nullable=True)

    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(40), nullable=True)
    whatsapp_greeting: Mapped[str | None] = mapped_column(String(300), nullable=True)
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)

    hours: Mapped[list] = mapped_column(JSON, default=list)  # [{"days": str, "time": str}]
    timeslots: Mapped[list] = mapped_column(JSON, default=list)  # ["18:00", ...]

    announcement_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    announcement_text: Mapped[str | None] = mapped_column(String(300), nullable=True)
    announcement_href: Mapped[str | None] = mapped_column(String(300), nullable=True)
    announcement_label: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Billing (percent, e.g. 5.00 = 5% GST/VAT applied at invoice time)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)

    # Loyalty program rates — owner-controlled earn/redeem economics.
    loyalty_points_per_currency: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=1)
    loyalty_redeem_rate: Mapped[Decimal] = mapped_column(Numeric(6, 4), default=0.01)

    # Page slugs currently toggled "unlive" from Admin > Pages — hidden from
    # the public nav and shown a placeholder instead of real content.
    hidden_pages: Mapped[list[str]] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
