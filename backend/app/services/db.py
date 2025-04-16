import os
import asyncpg
from dotenv import load_dotenv


load_dotenv()


class Database:
	
	"""
	
	Database connection manager for PostgreSQL using asyncpg.
	
	"""
	
	def __init__(self):
		
		"""
		
		Initialize the Database class.
		
		"""
		
		self.pool = None
	
	
	async def connect(self):
		
		"""
		
		Establish a connection to the PostgreSQL database.
		
		:return: None
		:rtype: None
		
		"""
		
		self.pool = await asyncpg.create_pool(
				user = os.getenv("DB_USER"),
				password = os.getenv("DB_PASSWORD"),
				database = os.getenv("DB_NAME"),
				host = os.getenv("DB_HOST"),
				port = int(os.getenv("DB_PORT")),
				min_size = 1,
				max_size = 5,
				)
		
	
	async def disconnect(self):
		
		"""
		
		Close the database connection pool.
		
		:return: None
		:rtype: None
		"""
		
		if self.pool:
			
			await self.pool.close()
	
	
	async def create_table_if_not_exists_embeddings(self):
		
		"""
		
		Create the document_embeddings table if it doesn't exist.
		
		:return: None
		:rtype: None
		"""
		
		# Get the connection from the pool
		async with self.pool.acquire() as conn:
			
			# Execute the SQL command to create the table
			await conn.execute(
					"""
					CREATE EXTENSION IF NOT EXISTS vector;
					
					CREATE TABLE IF NOT EXISTS document_embeddings (
					id SERIAL PRIMARY KEY,
					hoa_code VARCHAR(50),
					document_type VARCHAR(100),
					chunk_index INTEGER,
					page_number INTEGER,
					content TEXT,
					embedding VECTOR(3072)
					);
					"""
					)
	
	
	async def insert_embedding(self, hoa_code, document_type, chunk_index, page_number, content, embedding):
		
		"""
		
		Insert a new document embedding into the database.
		
		:param hoa_code: 9-digit alphanumeric HOA code
		:type hoa_code: str
		:param document_type: Description of the document
		:type document_type: str
		:param chunk_index: Index of the chunk in the document
		:type chunk_index: int
		:param page_number: Page number of the chunk in the document
		:type page_number: int
		:param content: Text content of the chunk
		:type content: str
		:param embedding: Vector embedding of the chunk
		:type embedding: List[float]
		
		:return: None
		:rtype: None
		"""
		
		# Check if the pool is initialized
		if not self.pool:
			
			# Raise an error if the pool is not initialized
			raise RuntimeError("Database connection pool is not initialized.")
		
		# Convert the Python list to a string for PostgreSQL vector
		embedding_str = str(embedding)
		
		async with self.pool.acquire() as conn:
			await conn.execute(
					"""
					INSERT INTO document_embeddings (
					hoa_code, document_type, chunk_index, page_number, content, embedding
					) VALUES ($1, $2, $3, $4, $5, $6)
					""",
					hoa_code, document_type, chunk_index, page_number, content, embedding_str
					)
