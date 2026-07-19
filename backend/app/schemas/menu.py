from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class VariantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    price: Decimal
    is_default: bool
    sort_order: int


class VariantWrite(BaseModel):
    name: str
    price: Decimal
    is_default: bool = False
    sort_order: int = 0


class AddonRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    price: Decimal
    is_available: bool
    sort_order: int


class AddonWrite(BaseModel):
    name: str
    price: Decimal
    is_available: bool = True
    sort_order: int = 0


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    slug: str
    sort_order: int


class CategoryWrite(BaseModel):
    name: str
    slug: str
    sort_order: int = 0


class MenuItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    category_id: str
    name: str
    description: str
    base_price: Decimal
    dietary_tags: list[str]
    model_tone: str
    photo_url: str | None
    photo_alt: str | None
    is_available: bool
    is_active: bool
    sort_order: int
    variants: list[VariantRead] = []
    addons: list[AddonRead] = []


class MenuItemCreate(BaseModel):
    category_id: str
    name: str
    description: str = ""
    base_price: Decimal
    dietary_tags: list[str] = []
    model_tone: str = "warm"
    photo_url: str | None = None
    photo_alt: str | None = None
    sort_order: int = 0


class MenuItemUpdate(BaseModel):
    category_id: str | None = None
    name: str | None = None
    description: str | None = None
    base_price: Decimal | None = None
    dietary_tags: list[str] | None = None
    model_tone: str | None = None
    photo_url: str | None = None
    photo_alt: str | None = None
    is_available: bool | None = None
    is_active: bool | None = None
    sort_order: int | None = None
