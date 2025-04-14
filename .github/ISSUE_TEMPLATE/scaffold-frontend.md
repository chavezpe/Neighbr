---
name: Scaffold Frontend
about: Start a minimal frontend for file upload and querying
title: "Frontend: Scaffold Simple Frontend"
labels: frontend, react, ui
---

## 🖥️ Description

Set up a simple UI (React preferred) where users can:

- Upload a PDF document
- Ask a question related to that PDF
- View the AI-generated answer

Keep the frontend loosely coupled from the backend. You'll later integrate this with FastAPI endpoints and vector responses.

---

## ✅ Tasks

- [ ] Create frontend folder with Vite + React or basic HTML form
- [ ] Add a file input for PDF uploads
- [ ] Add a text input for question submission
- [ ] Display response from `/api/query`
- [ ] Use Axios or Fetch for POST requests
- [ ] Keep styles minimal (can enhance later)

---

## 💡 Notes

For now, this can be a static HTML/React page that posts to the backend. Deployment will eventually happen separately for scalability (e.g. S3 + CloudFront or Vercel).

