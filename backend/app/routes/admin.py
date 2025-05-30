from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from utils.auth import verify_token
from utils.db_instance import db
from utils.security import hash_password


router = APIRouter()


class CommunityCreateRequest(BaseModel):
	
	"""

	Community creation request model.

	"""
	
	name: str
	max_households: int  # This should come from the plan tier logic
	admin_name: str
	admin_email: EmailStr
	admin_password: str


class UpgradeHouseholdsRequest(BaseModel):
	
	"""

	Upgrade household limit request model.

	"""
	
	community_code: str
	new_limit: int


class DeleteCommunityRequest(BaseModel):
	
	"""

	Delete community request model.

	"""
	
	community_code: str
	

class ViewAllUsersRequest(BaseModel):
	
	"""

	View all users request model.

	"""
	
	community_code: str
	
	
class DeleteUserRequest(BaseModel):
	
	"""

	Delete user request model.

	"""
	
	email: EmailStr
	hoa_code: str


@router.post("/create_community", tags = ["admin"])
async def create_community_with_admin(request: CommunityCreateRequest):
	
	"""
	
	Endpoint to create a new community with an admin user.

	:param request: Request object containing community and admin details
	:type request: CommunityCreateRequest

	:return: JSON response with success message and HOA code
	:rtype: dict

	"""
	
	try:
		
		# Hash the admin password
		hashed_password = hash_password(request.admin_password)
		
		# Generate a unique HOA code (9-digit alphanumeric)
		hoa_code = await db.create_community_with_admin(
				name = request.name,
				max_households = request.max_households,
				admin_name = request.admin_name,
				admin_email = request.admin_email,
				hashed_password = hashed_password,
				)
		
		# Return success message with HOA code
		return {"message": "Community created successfully", "hoa_code": hoa_code}
	
	# Handle case where community creation fails
	except Exception as e:
		
		# Handle any exceptions that occur during the community creation
		raise HTTPException(status_code = 500, detail = str(e))


@router.post("/upgrade_community", tags = ["admin"])
async def upgrade_household_limit(
		request: UpgradeHouseholdsRequest,
		payload: dict = Depends(verify_token)
		):
	
	"""
	
	Upgrade the household limit for a community.
	
	:param request: Request object containing community code and new limit
	:type request: UpgradeHouseholdsRequest
	:param payload: Decoded JWT token payload
	:type payload: dict
	
	:return: JSON response with success message
	:rtype: dict
	
	"""
	
	try:
		
		# Check if the user is an admin
		if not payload.get("is_admin"):

			# Raise an HTTP exception if the user is not an admin
			raise HTTPException(status_code = 403, detail = "Admin access required.")
		
		# Update the maximum household limit in the database
		await db.update_max_households(
				community_code = request.community_code,
				new_limit = request.new_limit
				)
		
		# Return success message
		return {"message": "Household limit updated successfully"}
	
	# Handle case where the community code is not found or other errors
	except Exception as e:
		
		# Handle any exceptions that occur during the upgrade
		raise HTTPException(status_code = 500, detail = str(e))


@router.post("/delete_community", tags = ["admin"])
async def delete_community(
		request: DeleteCommunityRequest,
		payload: dict = Depends(verify_token)
		):
	
	"""
	
	Delete a community by its HOA code.
	
	:param request: Request object containing community code
	:type request: DeleteCommunityRequest
	:param payload: Decoded JWT token payload
	:type payload: dict
	
	:return: JSON response with success message
	:rtype: dict
	"""
	
	try:
		
		# Check if the user is an admin
		if not payload.get("is_admin"):

			# Raise an HTTP exception if the user is not an admin
			raise HTTPException(status_code = 403, detail = "Admin access required.")
		
		# Delete the community from the database
		await db.delete_community_by_code(request.community_code)
		
		# Return success message
		return {"message": "Community deleted successfully"}
	
	# Handle case where the community code is not found or other errors
	except Exception as e:
		
		# Handle any exceptions that occur during the deletion
		raise HTTPException(status_code = 500, detail = str(e))
	
	
@router.post('/view_all_users', tags = ['admin'])
async def view_all_users(
		request: ViewAllUsersRequest,
		# payload: dict = Depends(verify_token)
		):
	
	"""
	
	View all users in the community.
	
	:param request: Request object containing community code
	:type request: DeleteCommunityRequest
	:param payload: Decoded JWT token payload
	:type payload: dict
	
	:return: JSON response with list of users
	:rtype: dict
	
	"""
	
	try:
		
		# # Check if the user is an admin
		# if not payload.get("is_admin"):
		#
		# 	# Raise an HTTP exception if the user is not an admin
		# 	raise HTTPException(status_code = 403, detail = "Admin access required.")
		
		# Fetch all users from the database
		users = await db.get_users_by_community_code(
				hoa_code = request.community_code
				)
		
		return {"users": users}
	
	except Exception as e:
		
		raise HTTPException(status_code = 500, detail = str(e))
	
	
@router.post('/delete_user', tags = ['admin'])
async def delete_user(
		request: DeleteUserRequest,
		):
	
	"""
	
	Delete a user from the community.
	
	:param request: Request object containing user email and HOA code
	:type request: DeleteUserRequest
	
	:return: JSON response with success message
	:rtype: dict
	
	
	"""
	
	try:
		
		await db.delete_user_by_email(
				email = request.email,
				hoa_code = request.hoa_code
				)
		
		return {"message": "User deleted successfully"}
	
	except Exception as e:
		
		raise HTTPException(status_code = 500, detail = str(e))
