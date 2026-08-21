# Hari AI Works — Python API

FastAPI backend: Firestore (Admin SDK), admin sessions, portfolio payload, seed.

## Setup

```bash
cd backend
# recommended: uv
uv sync
cp .env.example .env
uv run uvicorn app.main:app --reload --port 8000
```

Or with pip:

```bash
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | Public |
| GET | `/api/portfolio` | Public |
| POST | `/api/auth/login` | Public → httpOnly cookie |
| POST | `/api/auth/logout` | Cookie |
| GET | `/api/auth/me` | Cookie |
| * | `/api/admin/*` | Cookie |

OpenAPI: http://localhost:8000/docs
