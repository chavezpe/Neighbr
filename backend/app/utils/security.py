import bcrypt


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
