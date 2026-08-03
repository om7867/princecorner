from pydantic import BaseModel, ConfigDict


class TableRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    code: str
    is_active: bool


class TableCreate(BaseModel):
    code: str


class TableBulkCreate(BaseModel):
    count: int


class TableUpdate(BaseModel):
    is_active: bool | None = None
