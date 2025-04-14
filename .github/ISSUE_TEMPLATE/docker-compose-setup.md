---
name: Docker Compose Setup
about: Add a Docker Compose file for local multi-service dev
title: "DevOps: Add docker-compose.yml for Local Dev"
labels: devops, docker
---

## 🐳 Description

Set up a `docker-compose.yml` to run:

- The FastAPI backend container
- A FAISS vector index (or alternative service)
- (Optional) PostgreSQL or another service for logging/user data

This simplifies local development and ensures everything can be tested together.

---

## ✅ Tasks

- [ ] Create `docker-compose.yml` at root
- [ ] Add service for FastAPI app (build from backend/Dockerfile)
- [ ] Add volume mounts + ports
- [ ] Add FAISS or placeholder container for vector storage (can just volume it locally)
- [ ] (Optional) Add PostgreSQL container with persistent volume
- [ ] Add `.env` support if needed

---

## 💡 Example

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    env_file:
      - .env
```