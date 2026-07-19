from decimal import Decimal

from pydantic import BaseModel, ConfigDict


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
