import pytest
from backend.app.utils.pdf_utils import PDFProcessor
import fitz
import io


# Helper: Create a dummy PDF in-memory
def create_test_pdf(text: str) -> bytes:
    buffer = io.BytesIO()
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    doc.save(buffer)
    buffer.seek(0)
    return buffer.read()


@pytest.fixture
def pdf_processor():
    return PDFProcessor(max_chunk_length = 50)


def test_extract_text(pdf_processor):
    sample_text = "This is a test PDF file. It has multiple sentences. Here's one more!"
    pdf_bytes = create_test_pdf(sample_text)
    
    extracted_text = pdf_processor.extract_text(pdf_bytes)
    
    assert isinstance(extracted_text, str)
    assert "test PDF file" in extracted_text
    assert extracted_text.count(".") >= 2


def test_chunk_text(pdf_processor):
    long_text = (
        "This is sentence one. "
        "This is sentence two. "
        "This is sentence three. "
        "This is sentence four. "
        "This is sentence five. "
        "This is sentence six. "
        )
    
    chunks = pdf_processor.chunk_text(long_text)
    
    assert isinstance(chunks, list)
    assert all(isinstance(chunk, str) for chunk in chunks)
    assert all(len(chunk) <= 50 for chunk in chunks)
    assert len(chunks) >= 2  # Should break into multiple chunks
