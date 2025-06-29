from sqlalchemy import Boolean, Column, Integer, String
from .database import Base # Assuming Base is defined in database.py

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    is_active = Column(Boolean, default=True)

# If you had other models, they would go here, e.g.:
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, index=True)
#     hashed_password = Column(String)
#     is_active = Column(Boolean, default=True)
#     items = relationship("Item", back_populates="owner")

# And Item model would need an owner_id and relationship:
# owner_id = Column(Integer, ForeignKey("users.id"))
# owner = relationship("User", back_populates="items")
