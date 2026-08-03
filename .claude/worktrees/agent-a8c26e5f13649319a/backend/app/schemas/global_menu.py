from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class GlobalMenuItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    organization_id: str
    name: str
    description: str
    base_price: Decimal
    category_name: str
    dietary_tags: list[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class GlobalMenuItemCreate(BaseModel):
    name: str
    description: str = ""
    base_price: Decimal
    category_name: str
    dietary_tags: list[str] = []


class GlobalMenuItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    base_price: Decimal | None = None
    category_name: str | None = None
    dietary_tags: list[str] | None = None
    is_active: bool | None = None
