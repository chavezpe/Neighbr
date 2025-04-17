from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from routes.query import router as query_router
from routes.upload import router as upload_router
from routes.admin import router as admin_router
from routes.auth import router as auth_router
from utils.db_instance import db


# "HOA-520-293-884"

test_credentials = {
    "name": "Test-HOA",
    "max_households": 10,
    "admin_name": "Angel Chavez",
    "admin_email": "achavezpen@gmail.com",
    "admin_password": "Neighbr"
    }

test_toke = {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhY2hhdmV6cGVuQGdtYWlsLmNvbSIsInVzZXJfaWQiOiIxIiwiY29tbXVuaXR5X2lkIjoiMSIsImlzX2FkbWluIjp0cnVlLCJleHAiOjE3NDQ4NDQ1NTZ9.2ImA0pHlzo-z3q1keViAb8YsNJO0hXmxfe3oZEv1_qA",
    "token_type": "bearer"
    }

"""

cd backend/app
uvicorn main:app --reload or uvicorn main:app --host 127.0.0.1 --port 8000

http://127.0.0.1:8000/api/v1/docs

"""

app = FastAPI(
        title = "Neighbr API",
        description = "API for the Smart Policy Assistant",
        version = "0.1.0",
        openapi_url = "/api/v1/openapi.json",
        docs_url = "/api/v1/docs",
        redoc_url = "/api/v1/redoc",
        openapi_tags = [
            {
                "name": "upload",
                "description": "Upload and process PDF files.",
                },
            {
                "name": "query",
                "description": "Query the database.",
                },
            {
                "name": "admin",
                "description": "Admin operations.",
                },
            ],
        )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "auth/login")

# Optional: Enable CORS in development mode
app.add_middleware(
        CORSMiddleware,
        allow_origins = ["*"],  # Adjust in prod!  allow_origins=["https://your-frontend.com"]
        allow_credentials = True,
        allow_methods = ["*"],
        allow_headers = ["*"],
        )


@app.on_event("startup")
async def startup_event():
    
    await db.connect()
    
    # Create the table if it doesn't exist
    await db.create_table_if_not_exists_embeddings()
    await db.create_tables_for_users_and_communities()


@app.on_event("shutdown")
async def shutdown_event():
    
    await db.disconnect()


# Health check route
@app.get("/")
def read_root():
    return {"message": "Smart Policy Assistant backend is running!"}


# # Mount routers
app.include_router(query_router, prefix = "/query", tags = ["query"])
app.include_router(upload_router, prefix = "/upload", tags = ["upload"])
app.include_router(admin_router, prefix = "/admin", tags = ["admin"])
app.include_router(auth_router, prefix = "/auth", tags = ["auth"])
