from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas, database, security, dependencies # Added dependencies
from .models import UserRole # Import UserRole

# Create database tables if they don't exist
try:
    models.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"Error creating database tables: {e}")

app = FastAPI(title="Full-Stack App API", version="0.1.0")

# --- CORS Middleware ---
origins = [
    "http://localhost:3000",  # React default port
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
manager = ConnectionManager()


# --- API Routes ---

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Full-Stack App API!"}

# --- Authentication Endpoints ---
auth_router_prefix = "/auth"

@app.post(f"{auth_router_prefix}/register/patient", response_model=schemas.User, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register_patient(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Ensure the role is patient for this endpoint
    if user.role and user.role != UserRole.PATIENT:
        # Or silently override: user.role = UserRole.PATIENT
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role for patient registration")
    user.role = UserRole.PATIENT # Enforce patient role

    created_user = crud.create_user(db=db, user=user)
    return created_user

# Placeholder for healthcare professional registration (to be secured later)
@app.post(f"{auth_router_prefix}/register/professional", response_model=schemas.User, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register_healthcare_professional(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Ensure the role is healthcare_professional for this endpoint
    if user.role and user.role != UserRole.HEALTHCARE_PROFESSIONAL:
        # Or silently override: user.role = UserRole.HEALTHCARE_PROFESSIONAL
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role for professional registration")
    user.role = UserRole.HEALTHCARE_PROFESSIONAL # Enforce role

    created_user = crud.create_user(db=db, user=user)
    return created_user

from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta # Added timedelta

@app.post(f"{auth_router_prefix}/token", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=form_data.username) # OAuth2 form uses 'username' for email
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role.value}, # Add role to token data
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post(f"{auth_router_prefix}/forgot-password", status_code=status.HTTP_200_OK, tags=["Authentication"])
async def forgot_password(request: schemas.PasswordResetRequest, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        # Avoid leaking information about registered emails.
        # Still, for simplicity in this phase, we might raise or just return OK.
        # For better security, always return OK to prevent email enumeration.
        # However, for dev, knowing it failed is useful. Let's allow the specific error for now.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email does not exist.",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user cannot reset password.")

    password_reset_token = security.create_password_reset_token(email=user.email)

    # In a real application, you would email this token to the user.
    # For this example, we'll return it or log it.
    print(f"Password reset token for {user.email}: {password_reset_token}") # Log for dev

    # For testing, you might return the token. DO NOT do this in production.
    # return {"reset_token": password_reset_token, "message": "Password reset token generated. In a real app, this would be emailed."}
    return {"message": "If an account with this email exists, a password reset link has been sent."}


@app.post(f"{auth_router_prefix}/reset-password", status_code=status.HTTP_200_OK, tags=["Authentication"])
async def reset_password(payload: schemas.PasswordReset, db: Session = Depends(database.get_db)):
    email = security.verify_password_reset_token(payload.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    user = crud.get_user_by_email(db, email=email)
    if not user:
        # Should not happen if token generation was based on existing user, but good to check.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user cannot reset password.")

    hashed_password = security.get_password_hash(payload.new_password)
    user.hashed_password = hashed_password # Directly update on the model instance
    db.add(user) # Add to session to mark as dirty
    db.commit()
    db.refresh(user)

    return {"message": "Password has been reset successfully."}


# --- WebSocket Endpoint ---
# (WebSocket endpoint remains the same)

# --- User specific endpoints ---
users_router_prefix = "/users"

@app.get(f"{users_router_prefix}/me", response_model=schemas.User, tags=["Users"])
async def read_users_me(current_user: models.User = Depends(dependencies.get_current_active_user)):
    """
    Get current logged-in user's details.
    """
    return current_user

# Example of fetching a specific user by ID (could be admin-only or for profiles)
# @app.get(f"{users_router_prefix}/{{user_id}}", response_model=schemas.User, tags=["Users"])
# async def read_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
#     # Add logic here: e.g., only admin can fetch arbitrary users, or user can fetch their own.
#     if current_user.id == user_id or current_user.role == models.UserRole.ADMIN: # Example authorization
#         user = crud.get_user(db, user_id=user_id)
#         if user is None:
#             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
#         return user
#     else:
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this user")


@app.websocket("/ws/{client_id}", name="WebSocket Chat")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    await manager.broadcast(f"Client #{client_id} joined the chat")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Client #{client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")
    except Exception as e:
        print(f"WebSocket error for client #{client_id}: {e}")
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} disconnected due to an error.")


# --- CRUD operations for Items (Example) ---
items_router_prefix = "/items"

@app.post(f"{items_router_prefix}/", response_model=schemas.Item, status_code=status.HTTP_201_CREATED, tags=["Items"])
def create_item_endpoint(item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    # In a real app, you might associate items with the logged-in user (owner_id)
    return crud.create_item(db=db, item=item) # Add owner_id=current_user.id if needed

@app.get(f"{items_router_prefix}/", response_model=List[schemas.Item], tags=["Items"])
def read_items_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

@app.get(f"{items_router_prefix}/{{item_id}}", response_model=schemas.Item, tags=["Items"])
def read_item_endpoint(item_id: int, db: Session = Depends(database.get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return db_item

@app.put(f"{items_router_prefix}/{{item_id}}", response_model=schemas.Item, tags=["Items"])
def update_item_endpoint(item_id: int, item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    db_item = crud.update_item(db, item_id=item_id, item_update=item)
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found to update")
    return db_item

@app.delete(f"{items_router_prefix}/{{item_id}}", response_model=schemas.Item, tags=["Items"])
def delete_item_endpoint(item_id: int, db: Session = Depends(database.get_db)):
    db_item = crud.delete_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found to delete")
    return db_item
