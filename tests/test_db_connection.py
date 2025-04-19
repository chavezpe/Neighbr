import asyncio
from backend.app.services.db import Database  # Update the import path as needed


async def test_connection():
	db = Database()
	try:
		await db.connect()
		print("✅ Successfully connected to the database.")
	except Exception as e:
		print(f"❌ Failed to connect to the database: {e}")
	finally:
		await db.disconnect()


if __name__ == "__main__":
	asyncio.run(test_connection())
