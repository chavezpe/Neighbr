from fastapi import APIRouter, Form, HTTPException, status, Depends
from utils.auth import create_access_token
from utils.db_instance import db
from utils.security import hash_password, verify_password
from utils.auth import verify_token


router = APIRouter()


@router.post("/signup")
async def signup(
		name: str = Form(...),
		email: str = Form(...),
		password: str = Form(...),
		hoa_code: str = Form(...)
		) -> dict:
	
	"""
	
	Sign up a new user and return JWT access token.
	
	:param name: User's name
	:type name: str
	:param email: User's email address
	:type email: str
	:param password: User's password
	:type password: str
	:param hoa_code: Community HOA code
	:type hoa_code: str
	
	:return: JSON response containing access token and token type
	:rtype: dict
	"""
	
	# Check if the email already exists
	existing_user = await db.get_user_by_email(email)
	
	if existing_user:
		
		# If the email is already registered, raise an HTTP exception
		raise HTTPException(
				status_code = status.HTTP_400_BAD_REQUEST,
				detail = "Email already registered."
				)
	
	# Hash the user's password
	hashed_pw = hash_password(password)
	
	# Try to add user to community, catch validation errors
	try:
		
		# Add user to the community
		await db.add_user_to_community(
				name = name,
				email = email,
				hashed_password = hashed_pw,
				is_admin = False,
				community_code = hoa_code
				)
	
	# If the HOA code is invalid, raise an HTTP exception
	except ValueError as e:
		
		# Raise an HTTP exception with a 400 status code
		raise HTTPException(status_code = 400, detail = str(e))
	
	# Fetch the user (for token)
	user = await db.get_user_by_email(email)
	
	# Create token with relevant data
	token_data = {
		"sub": email,
		"user_id": str(user["id"]),
		"community_code": str(user["community_code"]),
		"is_admin": False
		}
	
	# Create the access token
	token = create_access_token(data = token_data)
	
	return {
		"access_token": token,
		"token_type": "bearer"
		}


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
	
	# Get community name
	community = await db.get_community_by_code(user["community_code"])
	
	# Store user data in the token
	token_data = {
		"sub": email,
		"user_id": str(user["id"]),
		"community_code": str(user["community_code"]),
		"community_name": community["name"],
		"is_admin": user["is_admin"],
		}
	
	# Create the access token
	token = create_access_token(data = token_data)
	
	# Return the token in the response
	return {
		"access_token": token,
		"token_type": "bearer"
		}


@router.get("/verify")
async def verify_user(payload: dict = Depends(verify_token)):
	
	"""
	Verify a user's token and return user payload if valid.
	"""
	
	return {"status": "ok", "user": payload}