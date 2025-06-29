from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env

# Configuration for JWT
# It's crucial to keep these secret and store them securely, e.g., in environment variables.
# For demonstration, we'll use os.getenv, expecting them to be in a .env file or environment.
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-shhh") # CHANGE THIS IN PRODUCTION!
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")) # Default 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")) # Default 7 days

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenPayload(BaseModel):
    sub: Optional[str] = None # Subject (usually the user identifier, e.g., email or user_id)
    exp: Optional[datetime] = None # Expiration time
    purpose: Optional[str] = None # To differentiate token types, e.g., "access", "password_reset"
    role: Optional[str] = None # For access tokens

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a plain password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Optional: Function to create a refresh token (if implementing refresh token strategy)
def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a new JWT refresh token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # Can use a different secret/algo for refresh
    return encoded_jwt

def decode_token(token: str) -> Optional[TokenPayload]:
    """Decodes a JWT token and returns the payload if valid."""
    try:
        payload_dict = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**payload_dict)
    except JWTError:
        return None

# Example of how to add these to your .env.example and .env
# --- .env / .env.example ---
# SECRET_KEY=a_very_strong_and_long_random_secret_key_please_change_me
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30
# REFRESH_TOKEN_EXPIRE_DAYS=7
# --- end .env / .env.example ---

# Remember to add these variables to your backend/.env.example file
# and generate a real SECRET_KEY for your .env file.
# You can generate a secret key using:
# python -c 'import secrets; print(secrets.token_hex(32))'
# and then add it to your .env file.
# E.g., SECRET_KEY=your_generated_32_byte_hex_string
# Make sure .env is in .gitignore

# --- Password Reset Token Specifics ---
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "15")) # Default 15 minutes

def create_password_reset_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "exp": expire,
        "sub": email, # Subject is the user's email
        "purpose": "password_reset" # Custom claim to differentiate token type
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verifies the password reset token.
    Returns the email if the token is valid and for password reset purpose, otherwise None.
    """
    payload = decode_token(token) # Uses the generic decode_token
    if payload and payload.sub and payload.exp:
        # Check if token has not expired
        if datetime.now(timezone.utc) > payload.exp:
            return None # Token expired
        # Check if the purpose claim is correct (if you add it during creation)
        # This part depends on whether `decode_token` returns the raw dict or TokenPayload
        # For simplicity, assuming decode_token gives access to all claims via attribute or dict access
        # Let's adjust decode_token to return the raw payload dict for flexibility or add 'purpose' to TokenPayload

        # To access custom claims like 'purpose', we should ensure decode_token can provide them.
        # A simple way is to have decode_token return the dict from jwt.decode.
        # Let's modify `decode_token` slightly for this or assume TokenPayload can hold extra fields.
        # For now, let's assume `jwt.decode` was successful and we can access `payload.get('purpose')` if it returns a dict
        # Or if TokenPayload is flexible. Let's assume we get the email (sub) for now.

        # A more robust check would be to inspect the 'purpose' claim.
        if payload.purpose != "password_reset":
            return None # Token not for password reset

        return payload.sub # Return email (subject of the token)
    return None
