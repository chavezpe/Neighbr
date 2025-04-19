from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from services.upload_service import UploadService
from utils.pdf_utils import PDFProcessor
from services.embeddings import EmbeddingService
import os
from utils.db_instance import db
from utils.auth import verify_token


router = APIRouter()

USE_S3 = os.getenv("USE_S3", "false").lower() == "true"
upload_service = UploadService(use_s3 = USE_S3)
pdf_processor = PDFProcessor()
embedding_service = EmbeddingService()


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
        document_type: str = Form(...),
        payload: dict = Depends(verify_token)
        ):
    
    """
    Endpoint to upload a PDF file to a local or S3 bucket path specific to an HOA.

    :param file: PDF file to upload
    :type file: UploadFile
    :param hoa_code: 9-digit alphanumeric HOA code used for folder naming
    :type hoa_code: str
    :param document_type: Description of the document (used to name the file)
    :type document_type: str
    :param payload: Decoded JWT token payload
    :type payload: dict
    
    :return: JSON response with the file path or URL
    :rtype: dict
    """
    
    # Check if the user is an admin
    if not payload.get("is_admin"):

        # Raise an HTTP exception if the user is not an admin
        raise HTTPException(status_code = 403, detail = "Admin access required.")
    
    if not file.filename.endswith(".pdf"):
        
        return JSONResponse(content = {"error": "Only PDF files are allowed."}, status_code = 400)
    
    try:
        
        # Save the file using the upload service
        file_path = await upload_service.save_file(file, hoa_code = hoa_code, document_type = document_type)
        
        # Go back to the start of stream in case it was read during saving
        file.file.seek(0)
        
        # Read the file bytes for processing
        file_bytes = await file.read()
        
        # Extract chunks with metadata
        chunk_data = pdf_processor.extract_and_chunk(file_bytes)
        
        # Get just the text from each chunk
        texts = [item["chunk"] for item in chunk_data]
        
        # Generate embeddings for each text chunk
        embeddings = await embedding_service.get_embeddings(texts)
        
        # Pair each embedding with its metadata
        for item, embedding in zip(chunk_data, embeddings):
            
            # Insert the embedding into the database
            await db.insert_embedding(
                    hoa_code = hoa_code,
                    document_type = document_type,
                    chunk_index = item["chunk_index"],
                    page_number = item["page_number"],
                    content = item["chunk"],
                    embedding = embedding,
                    )
        
        # Return the response with file path and chunk information
        return JSONResponse(
                content = {
                    "message": "File uploaded and processed successfully",
                    "path": file_path,
                    }
                )
    
    except Exception as e:
        
        return JSONResponse(content = {"error": str(e)}, status_code = 500)
