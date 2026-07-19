from decimal import Decimal

from pydantic import BaseModel


class HoursEntry(BaseModel):
    days: str
    time: str


class SiteSettingsRead(BaseModel):
    name: str  # from Restaurant.name, surfaced here since it's the primary "rebrand" field
    tagline: str | None = None
    description: str | None = None
    logo_url: str | None = None
    favicon_url: str | None = None
    primary_color: str | None = None
    accent_color: str | None = None
    address_street: str | None = None
    address_area: str | None = None
    address_city: str | None = None
    maps_query: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    whatsapp_greeting: str | None = None
    email: str | None = None
    hours: list[HoursEntry] = []
    timeslots: list[str] = []
    announcement_enabled: bool = False
    announcement_text: str | None = None
    announcement_href: str | None = None
    announcement_label: str | None = None
    tax_rate: Decimal = Decimal("0")
    loyalty_points_per_currency: Decimal = Decimal("1")
    loyalty_redeem_rate: Decimal = Decimal("0.01")
    razorpay_enabled: bool = False  # computed from whether RAZORPAY_KEY_ID/SECRET are configured, not stored
    razorpay_key_id: str | None = None  # publishable key id — safe to expose, needed by Razorpay Checkout.js

    model_config = {"from_attributes": True}


class SiteSettingsUpdate(BaseModel):
    name: str | None = None
    tagline: str | None = None
    description: str | None = None
    logo_url: str | None = None
    favicon_url: str | None = None
    primary_color: str | None = None
    accent_color: str | None = None
    address_street: str | None = None
    address_area: str | None = None
    address_city: str | None = None
    maps_query: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    whatsapp_greeting: str | None = None
    email: str | None = None
    hours: list[HoursEntry] | None = None
    timeslots: list[str] | None = None
    announcement_enabled: bool | None = None
    announcement_text: str | None = None
    announcement_href: str | None = None
    announcement_label: str | None = None
    tax_rate: Decimal | None = None
    loyalty_points_per_currency: Decimal | None = None
    loyalty_redeem_rate: Decimal | None = None
