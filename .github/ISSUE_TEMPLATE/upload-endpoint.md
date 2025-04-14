---
name: Upload PDF Endpoint
about: Create endpoint to upload and extract text from PDFs
title: "Backend: Upload PDF Endpoint"
labels: backend, API
---

## 📄 Description

Build a FastAPI route to upload a PDF file and return the extracted text using PyMuPDF.

## 🧠 Requirements

- Accept file via `UploadFile`
- Use `fitz` (PyMuPDF) to extract text
- Return cleaned PDF text

## ✅ Tasks

- [ ] Add `/upload-pdf` route in `query.py`
- [ ] Implement `pdf_utils.extract_text_from_pdf`
- [ ] Test with a sample HOA PDF

