import os
import asyncio
import asyncpg
import pandas as pd
from dotenv import load_dotenv


load_dotenv()


async def export_to_csv():
	# Connect to your PostgreSQL DB
	conn = await asyncpg.connect(
			user = os.getenv("DB_USER"),
			password = os.getenv("DB_PASSWORD"),
			database = os.getenv("DB_NAME"),
			host = os.getenv("DB_HOST"),
			port = int(os.getenv("DB_PORT")),
			)
	
	# Run the query
	rows = await conn.fetch("SELECT * FROM document_embeddings")
	
	# Convert to pandas DataFrame
	df = pd.DataFrame([dict(row) for row in rows])
	
	# Save as CSV
	df.to_csv("document_embeddings_export.csv", index = False)
	
	# Run the query
	rows = await conn.fetch("SELECT * FROM communities")
	
	# Convert to pandas DataFrame
	df = pd.DataFrame([dict(row) for row in rows])
	
	# Save as CSV
	df.to_csv("communities_export.csv", index = False)
	
	# Run the query
	rows = await conn.fetch("SELECT * FROM users")
	
	# Convert to pandas DataFrame
	df = pd.DataFrame([dict(row) for row in rows])
	
	# Save as CSV
	df.to_csv("users.csv", index = False)
	print("✅ Exported files successfully")
	
	# Close the connection
	await conn.close()


# Run the async function
asyncio.run(export_to_csv())
