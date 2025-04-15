import logging
import os
from typing import List

from openai import AsyncOpenAI


class EmbeddingService:
	
	"""
	
	Service to interact with OpenAI's embedding API.
	
	"""
	
	def __init__(self, model: str = "text-embedding-3-large"):
		
		"""
		
		Initialize the EmbeddingService with the OpenAI API key and model.
		
		:param model: The OpenAI model to use for generating embeddings. Default is "text-embedding-3-large".
		:type model: str
		"""
		
		# Load the OpenAI API key from environment variables
		self.api_key = os.getenv("OPENAI_API_KEY")
		
		# Check if the API key is set
		if not self.api_key:
			
			raise ValueError("OPENAI_API_KEY not found in environment variables.")
		
		# Initialize the OpenAI client
		self.client = AsyncOpenAI(api_key = self.api_key)
		
		# Set the model to use for generating embeddings
		self.model = model
		
	
	async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
		
		"""
		
		Generate vector embeddings from a list of text chunks.

		:param texts: List of text strings to embed.
		:type texts: List[str]
		
		:return: List of vector embeddings.
		:rtype: List[List[float]]
		"""
		
		try:
			
			# Create embeddings using the OpenAI API
			response = await self.client.embeddings.create(
					input = texts,
					model = self.model
					)
			
			# Return the embeddings from the response
			return [record.embedding for record in response.data]
		
		# Handle any exceptions that occur during the API call
		except Exception as e:
			
			logging.exception("Failed to generate embeddings")
			
			raise RuntimeError(f"Embedding generation failed: {str(e)}")
