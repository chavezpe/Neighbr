---
name: FastAPI App Entry Point
about: Create the main FastAPI application file
title: "Backend: Implement FastAPI Entry Point"
labels: backend, api
---

## ⚙️ Description

Create the core `main.py` file that initializes the FastAPI app, includes CORS middleware (if needed), and mounts all routers from the `routes/` folder.

## ✅ Tasks

- [ ] Create `main.py` inside `backend/app/`
- [ ] Initialize `FastAPI()` app instance
- [ ] Add CORS middleware (optional, dev mode)
- [ ] Import and include `query_router` from `routes/query.py`
- [ ] Add root (`/`) route for health check
- [ ] Test the server with `uvicorn`

## 💡 Example Structure

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.query import query_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "FastAPI server is running!"}

app.include_router(query_router, prefix="/api")
```

