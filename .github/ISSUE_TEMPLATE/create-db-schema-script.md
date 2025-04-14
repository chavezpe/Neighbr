## 🏗️ Issue: Create DB Schema Initialization Script

### 📌 Description
Add a one-time script to initialize the schema using SQLAlchemy metadata.

### ✅ Tasks
- [ ] Create `create_tables.py`
- [ ] Import `Base` from models and call `Base.metadata.create_all(bind=engine)`
- [ ] Add instructions to run this once in README
