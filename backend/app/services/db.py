import os
import random

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
	
	@staticmethod
	def generate_hoa_code():
		
		"""
		
		Generate HOA code in the format HOA-XXX-XXX-XXX
		
		"""
		
		parts = ["".join([str(random.randint(0, 9)) for _ in range(3)]) for _ in range(3)]
		
		return f"HOA-{parts[0]}-{parts[1]}-{parts[2]}"
	
	
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
	
	
	async def get_relevant_chunks_with_context(
			self,
			query_embedding: list[float],
			hoa_code: str,
			top_k: int = 3,
			) -> list[dict]:

		"""
		Retrieve relevant chunks and their surrounding context based on vector similarity.

		:param query_embedding: The embedding vector of the user's query
		:type query_embedding: list[float]
		:param hoa_code: HOA code to filter relevant documents
		:type hoa_code: str
		:param top_k: Number of top relevant base chunks to retrieve
		:type top_k: int

		:return: Ordered list of chunks with context
		:rtype: List[dict]
		
		"""
		
		# Check if the pool is initialized
		if not self.pool:
			raise RuntimeError("Database connection pool is not initialized.")
		
		# Convert the Python list to a string for PostgreSQL vector
		embedding_str = str(query_embedding)
		
		# Get the connection from the pool
		async with self.pool.acquire() as conn:
			
			# Step 1: Get top-K most relevant chunks by similarity
			top_chunks = await conn.fetch(
					"""
					SELECT chunk_index, document_type
					FROM document_embeddings
					WHERE hoa_code = $1
					ORDER BY embedding <#> $2 ASC
					LIMIT $3
					""",
					hoa_code,
					embedding_str,
					top_k,
					)
			
			# Step 2: Get max chunk_index for each relevant document_type
			document_types = list(set(chunk["document_type"] for chunk in top_chunks))
			
			# Fetch max chunk index for each document type
			max_chunk_results = await conn.fetch(
					"""
					SELECT document_type, MAX(chunk_index) AS max_index
					FROM document_embeddings
					WHERE hoa_code = $1 AND document_type = ANY($2::text[])
					GROUP BY document_type
					""",
					hoa_code,
					document_types,
					)
			
			# Create a mapping of document_type to max_index
			max_chunk_map = {row["document_type"]: row["max_index"] for row in max_chunk_results}
			
			# Step 3: For each top chunk, collect -1, 0, +1 (if in bounds)
			context_query_params = []
			
			# Iterate through the top chunks and collect context query parameters
			for chunk in top_chunks:
				
				# Get the chunk index and document type
				chunk_index = chunk["chunk_index"]
				
				# Get the max index for the document type
				document_type = chunk["document_type"]
				
				# Get the max index for the current document type
				max_index = max_chunk_map[document_type]
				
				# Collect the context query parameters for -1, 0, +1 offsets
				for offset in [-1, 0, 1]:
					
					# Calculate the new index
					idx = chunk_index + offset
					
					# Check if the index is within bounds
					if 0 <= idx <= max_index:
						
						# Append the parameters to the context query list
						context_query_params.append((hoa_code, document_type, idx))
			
			# Step 4: Deduplicate context chunks
			context_query_params = list(set(context_query_params))
			
			# Step 5: Fetch all contextual chunks
			all_chunks = await conn.fetch(
					"""
					SELECT chunk_index, content, document_type, page_number
					FROM document_embeddings
					WHERE (hoa_code, document_type, chunk_index) IN (
						SELECT x.hoa_code, x.document_type, x.chunk_index
						FROM UNNEST($1::text[], $2::text[], $3::int[]) AS x(hoa_code, document_type, chunk_index)
					)
					ORDER BY document_type, chunk_index
					""",
					[c[0] for c in context_query_params],  # hoa_code
					[c[1] for c in context_query_params],  # document_type
					[c[2] for c in context_query_params],  # chunk_index
					)
		
		# Deduplicate by (document_type, chunk_index)
		unique_chunks = {}
		
		# Iterate through all chunks and keep only unique ones
		for row in all_chunks:
			
			# Create a unique key for each chunk based on document_type and chunk_index
			key = (row["document_type"], row["chunk_index"])
			
			# If the key is not already in the unique_chunks dictionary, add it
			if key not in unique_chunks:
				
				# Store the chunk in the unique_chunks dictionary
				unique_chunks[key] = dict(row)
		
		# Return deduplicated list of chunks
		return list(unique_chunks.values())
	
	
	
	async def create_tables_for_users_and_communities(self):
		
		"""
		
		Create the communities and users tables if they don't exist.
		
		:return: None
		:rtype: None
		"""
		
		async with self.pool.acquire() as conn:
			# Execute the SQL command to create the tables
			await conn.execute(
					"""
					CREATE TABLE IF NOT EXISTS communities (
						id SERIAL PRIMARY KEY,
						name VARCHAR(100) NOT NULL,
						code VARCHAR(50) UNIQUE NOT NULL,
						max_households INTEGER NOT NULL,
						current_households INTEGER NOT NULL DEFAULT 0
					);

					CREATE TABLE IF NOT EXISTS users (
						id SERIAL PRIMARY KEY,
						name VARCHAR(100) NOT NULL,
						email VARCHAR(100) UNIQUE NOT NULL,
						hashed_password TEXT NOT NULL,
						is_admin BOOLEAN DEFAULT FALSE,
						community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE
					);
					"""
					)
	
	
	async def add_user_to_community(self, name, email, hashed_password, is_admin, community_code):
		
		"""
		
		Add a new user to a community.
		
		:param name: Name of the user
		:type name: str
		:param email: Email of the user
		:type email: str
		:param hashed_password: Hashed password of the user
		:type hashed_password: str
		:param is_admin: Whether the user is an admin
		:type is_admin: bool
		:param community_code: Community code to which the user belongs
		:type community_code: str
		:return: None
		:rtype: None
		
		"""
		
		async with self.pool.acquire() as conn:
			async with conn.transaction():
				community = await conn.fetchrow(
						"""
						SELECT id, current_households, max_households
						FROM communities
						WHERE code = $1
						""",
						community_code,
						)
				
				if not community:
					raise ValueError("Community not found")
				
				if community["current_households"] >= community["max_households"]:
					raise ValueError("Community household limit reached")
				
				await conn.execute(
						"""
						INSERT INTO users (name, email, hashed_password, is_admin, community_id)
						VALUES ($1, $2, $3, $4, $5)
						""",
						name, email, hashed_password, is_admin, community["id"]
						)
				
				await conn.execute(
						"""
						UPDATE communities
						SET current_households = current_households + 1
						WHERE id = $1
						""",
						community["id"]
						)
	
	
	async def create_community_with_admin(self, name, max_households, admin_name, admin_email, hashed_password) -> str:
		
		"""
		
		Create a new community with an admin user.
		
		:param name: Name of the community
		:type name: str
		:param max_households: Maximum number of households in the community
		:type max_households: int
		:param admin_name: Name of the admin user
		:type admin_name: str
		:param admin_email: Email of the admin user
		:type admin_email: str
		:param hashed_password: Hashed password of the admin user
		:type hashed_password: str
		
		:return: Generated HOA code for the community
		:rtype: str
		
		"""
		
		# Generate a unique HOA code
		hoa_code = self.generate_hoa_code()
		
		async with self.pool.acquire() as conn:
			
			# Start a transaction
			async with conn.transaction():
				
				# Ensure HOA code is unique
				while True:
					
					# Check if the HOA code already exists
					exists = await conn.fetchval("SELECT 1 FROM communities WHERE code = $1", hoa_code)
					
					# If it doesn't exist, break the loop
					if not exists:
						break
					
					# Generate a new HOA code
					hoa_code = self.generate_hoa_code()
				
				# Insert community
				community_id = await conn.fetchval(
						"""
						INSERT INTO communities (name, code, max_households, current_households)
						VALUES ($1, $2, $3, 1)
						RETURNING id
						""",
						name, hoa_code, max_households
						)
				
				# Insert admin user
				await conn.execute(
						"""
						INSERT INTO users (name, email, hashed_password, is_admin, community_id)
						VALUES ($1, $2, $3, TRUE, $4)
						""",
						admin_name, admin_email, hashed_password, community_id
						)
		
		return hoa_code
	
	
	async def delete_community_by_code(self, hoa_code: str):
		"""
		
		Deletes the community and all associated users based on the HOA code.
		
		:param hoa_code: HOA code of the community to delete
		:type hoa_code: str
		
		"""
		
		async with self.pool.acquire() as conn:
			# Execute the SQL command to delete the community and its users
			await conn.execute(
					"""
					DELETE FROM communities
					WHERE code = $1
					""",
					hoa_code
					)
	
	
	async def update_max_households(self, community_code, new_limit):
		
		"""
		
		Update the maximum number of households for a community.
		
		:param community_code: Community code
		:type community_code: str
		:param new_limit: New maximum number of households
		:type new_limit: int
		
		:return: None
		:rtype: None
		"""
		
		async with self.pool.acquire() as conn:
			# Send the SQL command to update the maximum number of households
			await conn.execute(
					"""
					UPDATE communities
					SET max_households = $1
					WHERE code = $2
					""",
					new_limit, community_code
					)
	
	
	async def get_user_by_email(self, email: str):
		
		"""
		
		Fetch a user by their email address.
		
		:param email: Email address of the user
		:type email: str
		
		:return: User record if found, None otherwise
		:rtype: dict or None
		"""
		
		# Query to fetch user by email
		query = "SELECT * FROM users WHERE email = $1"
		
		# Check if the pool is initialized
		async with self.pool.acquire() as conn:
			# Fetch the user record
			return await conn.fetchrow(query, email)
