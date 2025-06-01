import bcrypt
import os
from datetime import datetime, timedelta
from jose import jwt


def hash_password(password: str) -> str:
	
	"""
	
	Hashes a plain text password using bcrypt.
	
	:param password: The plain text password to hash.
	:type password: str
	
	:return: The hashed password.
	:rtype: str
	"""
	
	salt = bcrypt.gensalt()
	
	hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
	
	return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
	
	"""
	
	Verifies a plain password against the hashed version.
	
	:param plain_password: The plain text password to verify.
	:type plain_password: str
	:param hashed_password: The hashed password to compare against.
	:type hashed_password: str
	
	"""
	
	# Returns True if the password matches, False otherwise
	return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def generate_reset_token(email: str) -> str:
    """
    Generate a password reset token.
    """
    secret_key = os.getenv("RESET_TOKEN_SECRET")
    expires = datetime.utcnow() + timedelta(hours=24)
    
    return jwt.encode(
        {"email": email, "exp": expires},
        secret_key,
        algorithm="HS256"
    )


def verify_reset_token(token: str) -> str:
    """
    Verify a password reset token and return the email if valid.
    """
    secret_key = os.getenv("RESET_TOKEN_SECRET")
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload["email"]
    except:
        raise ValueError("Invalid or expired reset token")