from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from services.rag import RAG
from services.embeddings import EmbeddingService
from utils.db_instance import db
from utils.auth import verify_token
import os


router = APIRouter()

# Create instances of necessary services
embedding_service = EmbeddingService()
rag_service = RAG(db, embedding_service)


@router.post(
		"/answer_query",
		response_model = dict,
		tags = ["query"],
		summary = "Answer a user's query based on HOA documents",
		description = "Take a user's query, retrieve relevant document chunks, generate an answer, and provide sources."
		)
async def answer_query(
		query: str,
		hoa_code: str,
		# payload: dict = Depends(verify_token)
		):
	
	"""
	
	Endpoint to answer a user's query based on relevant document chunks.
	
	:param query: User's query/question
	:type query: str
	:param hoa_code: HOA code to filter relevant documents
	:type hoa_code: str
	:param payload: Decoded JWT token payload
	:type payload: dict
	
	:return: JSON response with the answer and sources
	:rtype: dict
	
	"""
	
	try:
		
		# Use QueryAnsweringService to get the full response (answer + sources)
		response = await rag_service.answer_query(query, hoa_code)
		
		# Return the response with the answer and sources
		return JSONResponse(content = {"answer": response})
	
	except Exception as e:
		# Handle errors (e.g., if any exception occurs during processing)
		return JSONResponse(content = {"error": str(e)}, status_code = 500)
