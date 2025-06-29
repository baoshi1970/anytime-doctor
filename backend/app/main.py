from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas, database # Added crud and schemas

# Create database tables if they don't exist
# This is generally done once, perhaps with Alembic in a more complex setup
try:
    models.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"Error creating database tables: {e}")
    # Depending on the error, you might want to exit or handle it differently

app = FastAPI()

# Allow CORS for local development (React frontend)
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

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI backend with PostgreSQL and WebSockets!"}

# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    await manager.broadcast(f"Client #{client_id} joined the chat")
    try:
        while True:
            data = await websocket.receive_text()
            # await manager.send_personal_message(f"You wrote: {data}", websocket) # Optional: send back to sender
            await manager.broadcast(f"Client #{client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")
    except Exception as e:
        print(f"WebSocket error for client #{client_id}: {e}")
        # Optionally, notify other clients or handle the error
        manager.disconnect(websocket) # Ensure disconnect on other errors too
        await manager.broadcast(f"Client #{client_id} disconnected due to an error.")


# CRUD operations for Items
@app.post("/items/", response_model=schemas.Item)
def create_item_endpoint(item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    # Example of checking for duplicate item name, if 'name' should be unique
    # db_item = crud.get_item_by_name(db, name=item.name) # Assuming you add get_item_by_name to crud.py
    # if db_item:
    #     raise HTTPException(status_code=400, detail="Item with this name already registered")
    return crud.create_item(db=db, item=item)

@app.get("/items/", response_model=List[schemas.Item])
def read_items_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item_endpoint(item_id: int, db: Session = Depends(database.get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item_endpoint(item_id: int, item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    db_item = crud.update_item(db, item_id=item_id, item_update=item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found to update")
    return db_item

@app.delete("/items/{item_id}", response_model=schemas.Item) # Or perhaps just a status code
def delete_item_endpoint(item_id: int, db: Session = Depends(database.get_db)):
    db_item = crud.delete_item(db, item_id=item_id)
    if db_item is None: # crud.delete_item might return the deleted item or None if not found
        raise HTTPException(status_code=404, detail="Item not found to delete")
    return db_item # Or return a confirmation message
