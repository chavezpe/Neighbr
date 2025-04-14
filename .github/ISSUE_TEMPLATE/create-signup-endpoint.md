## ✍️ Issue: Create Signup Endpoint for Users and Communities

### 📌 Description
Build a FastAPI route that allows a new HOA (with a random 9-digit alphanumeric code) to register and create the admin account. Also allow users to join an existing HOA using its code.

### ✅ Tasks
- [ ] Create `/auth/signup` route in `routes/auth.py`
- [ ] Accept user info (name, email, password), and optional community code
- [ ] If no code is provided, generate a new HOA with a 9-digit alphanumeric code and set the user as admin
- [ ] If code is provided, validate and add user to existing HOA
- [ ] Hash passwords before storing
- [ ] Return success message and user data (excluding password)