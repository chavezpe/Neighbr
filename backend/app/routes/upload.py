from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from services.upload_service import UploadService
from utils.pdf_utils import PDFProcessor
import os


router = APIRouter()

USE_S3 = os.getenv("USE_S3", "false").lower() == "true"
upload_service = UploadService(use_s3 = USE_S3)
pdf_processor = PDFProcessor()


@router.post(
        "/upload_pdf",
        response_model = dict,
        tags = ["upload"],
        summary = "Upload a PDF file",
        description = "Upload a PDF file to the server or S3 bucket under a specific HOA folder."
        )
async def upload_pdf(
        file: UploadFile = File(...),
        hoa_code: str = Form(...),
        document_type: str = Form(...)
        ):
    """
    Endpoint to upload a PDF file to a local or S3 bucket path specific to an HOA.

    :param file: PDF file to upload
    :param hoa_code: 9-digit alphanumeric HOA code used for folder naming
    :param document_type: Description of the document (used to name the file)
    :return: JSON response with the file path or URL
    """
    
    if not file.filename.endswith(".pdf"):
        
        return JSONResponse(content = {"error": "Only PDF files are allowed."}, status_code = 400)
    
    try:
        
        # Save the file using the upload service
        file_path = await upload_service.save_file(file, hoa_code = hoa_code, document_type = document_type)
        
        # Go back to the start of stream in case it was read during saving
        file.file.seek(0)
        
        # Read the file bytes for processing
        file_bytes = await file.read()
        
        # Extract text from the PDF
        text = pdf_processor.extract_text(file_bytes)
        
        # Chunk the text into manageable pieces
        chunks = pdf_processor.chunk_text(text)
        
        # Return the response with file path and chunk information
        return JSONResponse(
                content = {
                    "message": "File uploaded and processed successfully",
                    "path": file_path,
                    "chunk_count": len(chunks),
                    "avg_chunk_size": sum(len(c) for c in chunks) // len(chunks) if chunks else 0
                    }
                )
    
    except Exception as e:
        
        return JSONResponse(content = {"error": str(e)}, status_code = 500)
