from fastapi import APIRouter, HTTPException, status, Form
from utils.db_instance import db
from utils.security import verify_password
from utils.auth import create_access_token


router = APIRouter()


@router.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
	
	"""
	
	Authenticate user and return JWT access token.
	
	:param email: User's email address
	:type email: str
	:param password: User's password
	:type password: str
	
	:return: JSON response containing access token and token type
	:rtype: dict
	
	"""
	
	# Fetch user from the database using the provided email
	user = await db.get_user_by_email(email)
	
	# Check if user exists and verify the password
	if not user or not verify_password(password, user["hashed_password"]):
		raise HTTPException(
				status_code = status.HTTP_401_UNAUTHORIZED,
				detail = "Invalid email or password."
				)
	
	# Store user data in the token
	token_data = {
		"sub": email,
		"user_id": str(user["id"]),
		"community_id": str(user["community_id"]),
		"is_admin": user["is_admin"],
		}
	
	# Create the access token
	token = create_access_token(data = token_data)
	
	# Return the token in the response
	return {
		"access_token": token,
		"token_type": "bearer"
		}
