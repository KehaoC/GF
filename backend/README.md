# Guru Backend API

FastAPI backend for Guru creative tool.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run Development Server

```bash
python run.py
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/api/v1/docs
- Alternative docs: http://localhost:8000/api/v1/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get access token
- `POST /api/v1/auth/login/form` - OAuth2 password flow (for Swagger UI)

### Users
- `GET /api/v1/users/me` - Get current user info
- `PUT /api/v1/users/me` - Update current user

### Projects
- `GET /api/v1/projects/` - List user's projects
- `GET /api/v1/projects/examples` - List example projects (public)
- `POST /api/v1/projects/` - Create new project
- `GET /api/v1/projects/{id}` - Get project by ID
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/          # API routes
│   │       ├── auth.py
│   │       ├── projects.py
│   │       └── users.py
│   ├── core/            # Core functionality
│   │   ├── deps.py      # Dependencies
│   │   └── security.py  # JWT & password hashing
│   ├── models/          # SQLAlchemy models
│   │   ├── user.py
│   │   └── project.py
│   ├── schemas/         # Pydantic schemas
│   │   ├── token.py
│   │   ├── user.py
│   │   └── project.py
│   ├── config.py        # Configuration
│   ├── database.py      # Database setup
│   └── main.py          # FastAPI app
├── requirements.txt
├── run.py              # Development server
└── .env.example        # Environment variables template
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1. Register or login to get an access token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your-token>
   ```

## Database

By default, the API uses SQLite for simplicity. The database file will be created automatically at `guru.db`.

For production, update `DATABASE_URL` in `.env` to use PostgreSQL or MySQL.

## Development

### Create Test User

```bash
# Use the interactive docs at /api/v1/docs
# Or use curl:
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123", "email": "test@example.com"}'
```

### Test Authentication

```bash
# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# Use the returned token in subsequent requests
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer <your-token>"
```
