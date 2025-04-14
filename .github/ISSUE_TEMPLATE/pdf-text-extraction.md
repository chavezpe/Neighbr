---
name: PDF Text Extraction & Chunking
about: Use PyMuPDF to extract clean text and split into chunks for embedding
title: "Backend: Add PDF Text Extraction Utility + Chunking"
labels: backend, pdf, utils, embeddings
---

## 📄 Description

Implement a utility function in `pdf_utils.py` that:

1. Extracts clean, normalized text from PDF files using PyMuPDF (`fitz`)
2. Breaks the extracted text into well-sized chunks for downstream embedding and retrieval (RAG)

This will serve as the ingestion foundation for HOA bylaws, meeting minutes, and other documents.

---

## 📚 Requirements

### 📘 Text Extraction

- Use `fitz.open(stream=..., filetype="pdf")` to open PDFs from `UploadFile`
- Extract text from each page
- Optionally strip or detect repeated headers/footers
- Normalize whitespace and remove junk characters
- Return unified clean string

### 🔪 Chunking

- Split text into ~500-token chunks (or ~1000–1500 characters if token counting is not yet implemented)
- Ensure chunks break on sentence boundaries when possible
- Return a list of chunks (`List[str]`), not one big string
- This step ensures good performance with OpenAI embeddings and context-aware retrieval

---

## ✅ Tasks

- [ ] Add `extract_text_from_pdf(file_stream)` in `pdf_utils.py`
- [ ] Implement PDF reading using `fitz`
- [ ] Add basic text cleaning/normalization
- [ ] Create `chunk_text(text: str, max_length: int = 1000) -> List[str]`
- [ ] Make chunking sensitive to sentence boundaries (e.g. use `nltk` or `.split('.')`)
- [ ] Write a simple test to verify chunk count and average length

---

## 💡 Example Reference

```python
import fitz

def extract_text_from_pdf(file_stream) -> str:
    doc = fitz.open(stream=file_stream, filetype="pdf")
    return "\n".join(page.get_text() for page in doc).strip()

def chunk_text(text: str, max_length: int = 1000) -> list[str]:
    sentences = text.split('. ')
    chunks, current_chunk = [], ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < max_length:
            current_chunk += sentence + ". "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + ". "
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks
```