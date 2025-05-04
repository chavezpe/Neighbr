## 🧱 Issue: Define Community and User Models

### 📌 Description
Create SQLAlchemy models to represent HOAs and users, including relationships and constraints.

### ✅ Tasks
- [ ] Create `Community` model with `id`, `name`, and `code`
- [ ] Create `User` model with `id`, `name`, `email`, `hashed_password`, `is_admin`, and `community_code`
- [ ] Use relationships to link users to a community
- [ ] Ensure fields are indexed and unique where appropriate
