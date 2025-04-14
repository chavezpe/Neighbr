## 🔑 Issue: Implement Signup and Login Logic in AuthService

### 📌 Description
Create core logic to handle signup (with new or existing community) and login with password verification and JWT.

### ✅ Tasks
- [ ] Create `services/auth_service.py`
- [ ] Add function to generate random 9-digit community codes
- [ ] Add logic to:
  - Create new community + admin user
  - Join existing community
- [ ] Add login function that returns a JWT token
- [ ] Store `user_id` and `email` in token payload
