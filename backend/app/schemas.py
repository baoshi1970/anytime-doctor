from pydantic import BaseModel, EmailStr
from typing import Optional
from .models import UserRole # Import UserRole enum

# Pydantic models (schemas) for request/response validation & serialization

# --- Item Schemas ---
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    is_active: bool
    # owner_id: Optional[int] = None # If items have owners

    class Config:
        from_attributes = True # For Pydantic V2 (preferred)
        # orm_mode = True # For Pydantic V1

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.PATIENT # Default role, can be overridden

class UserUpdate(UserBase):
    password: Optional[str] = None # Allow password updates
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

class User(UserBase): # Schema for returning a user (without password)
    id: int
    is_active: bool
    role: UserRole
    # items: list[Item] = [] # If showing items owned by user

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None
    # You might add other claims like user_id, roles here if needed for token validation

# --- Password Reset Schemas ---
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str # The reset token received by the user
    new_password: str
