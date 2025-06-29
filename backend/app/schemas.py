from pydantic import BaseModel
from typing import Optional

# Pydantic models (schemas) for request/response validation & serialization

# Base model for Item, containing common attributes
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None

# Model for creating an item (inherits from ItemBase, no new fields needed for this example)
class ItemCreate(ItemBase):
    pass

# Model for reading an item (includes attributes from database, like id)
class Item(ItemBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True # For Pydantic V2
        # orm_mode = True # For Pydantic V1
