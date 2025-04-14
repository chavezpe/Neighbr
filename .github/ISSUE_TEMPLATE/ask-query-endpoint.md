---
name: Ask Query Endpoint
about: Add endpoint to send user question and get back answer from RAG system
title: "Backend: Ask Endpoint"
labels: backend, ai
---

## ❓ Description

Create a FastAPI POST route that receives a user query, retrieves relevant chunks via FAISS, and uses GPT to answer.

## ✅ Tasks

- [ ] Implement `/ask` route in `query.py`
- [ ] Add `answer_query(query)` in `rag.py`
- [ ] Prompt GPT with context + query

