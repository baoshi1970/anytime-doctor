from sqlalchemy import Boolean, Column, Integer, String, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    HEALTHCARE_PROFESSIONAL = "healthcare_professional"
    ADMIN = "admin" # Added admin for potential future use

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True, nullable=True) # Optional full name
    role = Column(SQLAlchemyEnum(UserRole), nullable=False, default=UserRole.PATIENT)
    is_active = Column(Boolean, default=True)

    # Add any other fields relevant to a user, e.g.:
    # phone_number = Column(String, unique=True, index=True, nullable=True)
    # profile_picture_url = Column(String, nullable=True)
    # created_at = Column(DateTime(timezone=True), server_default=func.now())
    # updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Example relationship (if users can own items, adjust as needed)
    # items = relationship("Item", back_populates="owner")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    is_active = Column(Boolean, default=True)

    # If items have an owner:
    # owner_id = Column(Integer, ForeignKey("users.id"))
    # owner = relationship("User", back_populates="items")
