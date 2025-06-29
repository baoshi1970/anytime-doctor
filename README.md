# Project Title: Full-Stack Web Application (React, FastAPI, PostgreSQL, WebSockets)

This project is a full-stack web application demonstrating the integration of:
- **Frontend:** React with TypeScript
- **Backend:** Python with FastAPI
- **Real-time Communication:** WebSockets
- **Database:** PostgreSQL

## Project Structure

```
.
├── Dockerfile.backend        # Dockerfile for the backend service
├── Dockerfile.frontend       # Dockerfile for the frontend service
├── backend/                  # Backend (FastAPI) application
│   ├── app/                  # Main application module
│   │   ├── __init__.py
│   │   ├── crud.py           # CRUD operations
│   │   ├── database.py       # Database connection and session
│   │   ├── main.py           # FastAPI app definition, endpoints
│   │   ├── models.py         # SQLAlchemy models
│   │   └── schemas.py        # Pydantic schemas
│   ├── .env.example          # Example environment variables for backend
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Frontend (React) application
│   ├── public/               # Public assets
│   │   └── index.html
│   ├── src/                  # React source files
│   │   ├── App.css
│   │   ├── App.tsx           # Main React app component
│   │   ├── index.css
│   │   ├── index.tsx         # React entry point
│   │   └── reportWebVitals.ts
│   ├── package.json          # NPM package configuration
│   ├── tsconfig.json         # TypeScript configuration
├── docker-compose.yml        # Docker Compose configuration for local development
└── README.md                 # This file
```

## Prerequisites

- Docker and Docker Compose installed on your system.
- Node.js and npm (or yarn) if you prefer to run the frontend outside of Docker for development.
- Python and pip if you prefer to run the backend outside of Docker for development.

## Getting Started (Docker)

This is the recommended way to run the application for development and consistency.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Environment Variables:**
    The backend service and PostgreSQL database require environment variables.
    Copy the example file in the `backend` directory:
    ```bash
    cp backend/.env.example backend/.env
    ```
    Review `backend/.env` and modify variables if needed (e.g., database credentials). The defaults are set up to work with the `docker-compose.yml` configuration.

3.  **Build and Run with Docker Compose:**
    From the project root directory (where `docker-compose.yml` is located):
    ```bash
    docker-compose up --build
    ```
    -   `--build` flag ensures images are built if they don't exist or if Dockerfiles have changed.
    -   This will start three services: `frontend`, `backend`, and `db` (PostgreSQL).

4.  **Accessing the Application:**
    -   **Frontend (React App):** Open your browser and go to `http://localhost:3000`
    -   **Backend (FastAPI):**
        -   API root: `http://localhost:8000/`
        -   Swagger UI (API docs): `http://localhost:8000/docs`
        -   ReDoc (API docs): `http://localhost:8000/redoc`
    -   **Database (PostgreSQL):** Accessible on port `5432` from your host machine if you need to connect with a DB client (credentials are in `backend/.env`). The service name within the Docker network is `db`.

5.  **Stopping the Application:**
    Press `Ctrl+C` in the terminal where `docker-compose up` is running.
    To remove the containers, networks, and volumes (including persisted database data):
    ```bash
    docker-compose down -v
    ```
    To stop without removing volumes:
    ```bash
    docker-compose down
    ```

## Development Notes

### Backend (FastAPI)
-   Located in the `backend/` directory.
-   The main application logic is in `backend/app/main.py`.
-   Dependencies are listed in `backend/requirements.txt`.
-   When running via Docker Compose, changes to the backend code in your local `backend/` directory will trigger a reload of the Uvicorn server due to the volume mount.

### Frontend (React)
-   Located in the `frontend/` directory.
-   The main application component is `frontend/src/App.tsx`.
-   Dependencies are listed in `frontend/package.json`.
-   When running via Docker Compose, changes to the code in your local `frontend/src/` directory will trigger a hot reload of the React development server.

### WebSocket Communication
-   The backend exposes a WebSocket endpoint at `ws://localhost:8000/ws/{client_id}`.
-   The frontend `App.tsx` component establishes a WebSocket connection to this endpoint for real-time message exchange.

### Database
-   PostgreSQL is used as the database.
-   SQLAlchemy models are defined in `backend/app/models.py`.
-   Database connection settings are in `backend/app/database.py` and configured via `backend/.env`.
-   When using `docker-compose up`, the database tables defined in `models.py` will be automatically created if they don't already exist.
-   Data is persisted in a Docker volume named `postgres_data`. To clear all data, use `docker-compose down -v`.

## Running Services Individually (Optional, for advanced development/debugging)

### Backend
1.  Navigate to the `backend` directory: `cd backend`
2.  (Optional, Recommended) Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies: `pip install -r requirements.txt`
4.  Ensure PostgreSQL is running and accessible. You might need to adjust `SQLALCHEMY_DATABASE_URL` in `backend/app/database.py` or set environment variables if not using Docker for Postgres.
5.  Run the FastAPI app: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` (assuming you are in the `backend` directory)

### Frontend
1.  Navigate to the `frontend` directory: `cd frontend`
2.  Install dependencies: `npm install` (or `yarn install`)
3.  Start the React development server: `npm start` (or `yarn start`)
    This will typically open the app at `http://localhost:3000`.

## Further Enhancements (TODO)

-   Implement user authentication and authorization.
-   Add more comprehensive error handling.
-   Write unit and integration tests for frontend and backend.
-   Set up CI/CD pipelines.
-   Refine UI/UX.
-   Implement production-ready Docker configurations (e.g., multi-stage builds, non-dev servers).
-   Use Alembic for database migrations.
-   More sophisticated state management for the frontend (e.g., Redux, Zustand).

This README provides a basic guide to get the project up and running. Enjoy exploring the codebase!
