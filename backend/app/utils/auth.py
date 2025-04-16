from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import os


# You can move these to environment variables in production
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 43800

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/auth/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
	
	"""
	
	Create a JWT access token with an expiration time.`
	
	:param data: Data to encode in the token
	:type data: dict
	:param expires_delta: Expiration time for the token
	:type expires_delta: timedelta, optional
	
	:return: Encoded JWT token
	:rtype: str
	
	"""
	
	# Copy the data to avoid modifying the original
	to_encode = data.copy()
	
	# Set the expiration time
	expire = datetime.utcnow() + (expires_delta or timedelta(minutes = ACCESS_TOKEN_EXPIRE_MINUTES))
	
	# Add the expiration time to the data
	to_encode.update({"exp": expire})
	
	# Encode the data to create the JWT token
	return jwt.encode(to_encode, SECRET_KEY, algorithm = ALGORITHM)


def verify_token(token: str = Depends(oauth2_scheme)):
	
	"""
	
	Verify the JWT token and decode its payload.
	
	:param token: JWT token to verify
	:type token: str
	
	:return: Decoded payload from the token
	:rtype: dict
	
	"""
	
	try:
		
		# Decode the token using the secret key and algorithm
		payload = jwt.decode(token, SECRET_KEY, algorithms = [ALGORITHM])
		
		# Return the payload
		return payload
	
	# Handle token expiration and invalid token errors
	except JWTError:
		
		# Raise an HTTP exception if the token is invalid or expired
		raise HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail = "Invalid or expired token")
