---
name: Add RAG Logic
about: Implement retrieval + generation using vector search and prompt composition
title: "Backend: Add RAG Logic to rag.py"
labels: backend, RAG, embeddings
---

## 🧠 Description

Implement the core Retrieval-Augmented Generation (RAG) pipeline in `rag.py`, using:

- Vector search to retrieve relevant chunks from stored embeddings
- Prompt construction to pass context + user query to OpenAI
- Return the answer grounded in retrieved context

---

## ✅ Tasks

- [ ] Add `retrieve_relevant_chunks(query)` using FAISS or Pinecone
- [ ] Add `build_prompt(chunks, query)` to format the prompt contextually
- [ ] Add `generate_answer(prompt)` using OpenAI ChatCompletion
- [ ] Compose above into `answer_query(query: str) -> str`
- [ ] Return full response (answer + sources, optionally)

---

## 💡 Tips

Example prompt structure:

