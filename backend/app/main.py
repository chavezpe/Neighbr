from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from routes.query import router as query_router
from routes.upload import router as upload_router
# from routes.admin import router as admin_router


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
    )

# Optional: Enable CORS in development mode
app.add_middleware(
        CORSMiddleware,
        allow_origins = ["*"],  # Adjust in prod!  allow_origins=["https://your-frontend.com"]
        allow_credentials = True,
        allow_methods = ["*"],
        allow_headers = ["*"],
        )


# Health check route
@app.get("/")
def read_root():
    return {"message": "Smart Policy Assistant backend is running!"}


# # Mount routers
# app.include_router(query_router, prefix = "/query", tags = ["query"])
app.include_router(upload_router, prefix = "/upload", tags = ["upload"])
# app.include_router(admin_router, prefix="/admin", tags = ["admin"])
