from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator


class SupplierRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    contact_phone: str | None
    contact_email: str | None


class SupplierWrite(BaseModel):
    name: str
    contact_phone: str | None = None
    contact_email: str | None = None


class IngredientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    unit: str
    stock_quantity: Decimal
    low_stock_threshold: Decimal
    supplier_id: str | None
    is_low_stock: bool = False


class IngredientCreate(BaseModel):
    name: str
    unit: str
    stock_quantity: Decimal = Decimal("0")
    low_stock_threshold: Decimal = Decimal("0")
    supplier_id: str | None = None


class IngredientUpdate(BaseModel):
    name: str | None = None
    unit: str | None = None
    stock_quantity: Decimal | None = None
    low_stock_threshold: Decimal | None = None
    supplier_id: str | None = None


class RecipeLineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    ingredient_id: str
    ingredient_name: str = ""
    unit: str = ""
    quantity_per_serving: Decimal


class RecipeLineWrite(BaseModel):
    ingredient_id: str
    quantity_per_serving: Decimal


# ── Inter-branch inventory transfers ──────────────────────────────────────


class SiblingBranchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str


class TransferRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    from_restaurant_id: str
    to_restaurant_id: str
    ingredient_name: str
    unit: str
    quantity: Decimal
    status: str
    note: str | None
    created_at: datetime
    resolved_at: datetime | None


class TransferRequestReadWithNames(TransferRequestRead):
    from_restaurant_name: str
    to_restaurant_name: str


class TransferRequestCreate(BaseModel):
    """The requester's own branch is always the destination (inferred
    server-side from `get_current_restaurant_for_staff`); `from_restaurant_id`
    names the sibling branch the requester wants to pull stock FROM."""

    from_restaurant_id: str
    ingredient_name: str
    unit: str
    quantity: Decimal
    note: str | None = None


class TransferRequestDecision(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in ("approved", "rejected"):
            raise ValueError("status must be 'approved' or 'rejected'")
        return value
