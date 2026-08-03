from pydantic import BaseModel, EmailStr

from app.models.user import RoleEnum


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    role: RoleEnum
    name: str


class MeResponse(BaseModel):
    id: str
    name: str
    email: str
    role: RoleEnum
