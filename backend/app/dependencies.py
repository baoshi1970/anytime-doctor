from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from . import crud, models, schemas, security, database

# OAuth2PasswordBearer scheme will look for the token in the Authorization header
# as a Bearer token. tokenUrl is the URL where the client can get the token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{security.SECRET_KEY}/token") # Using the auth router prefix from main.py
# Correction: tokenUrl should be the actual path to the token endpoint as defined in main.py
# The prefix is "/auth", so tokenUrl="/auth/token"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = security.decode_token(token)
    if payload is None or payload.sub is None: # payload.sub is the email
        raise credentials_exception

    # Optionally check token purpose if you use different tokens for different things via the same scheme
    # if payload.purpose != "access": # Assuming access tokens have a 'purpose' claim
    #     raise credentials_exception

    email: str = payload.sub
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

# Example of a dependency for role-based access (can be expanded)
# def require_role(required_role: models.UserRole):
#     async def role_checker(current_user: models.User = Depends(get_current_active_user)) -> models.User:
#         if current_user.role != required_role:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=f"User does not have the required role: {required_role.value}"
#             )
#         return current_user
#     return role_checker

# Example:
# @app.post("/admin/some-action", dependencies=[Depends(require_role(models.UserRole.ADMIN))])
# async def admin_action(...):
#     ...
