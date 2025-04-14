## 🔐 Issue: Create Login Endpoint with JWT

### 📌 Description
Build a login route that verifies credentials and returns a JWT token for the authenticated user.

### ✅ Tasks
- [ ] Create `/auth/login` route in `routes/auth.py`
- [ ] Accept email and password
- [ ] Verify user exists and password matches using `verify_password()`
- [ ] Generate JWT token with user ID and email in payload
- [ ] Return access token and token type
- [ ] Add appropriate error handling (401 on failure)
