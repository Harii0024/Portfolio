# Hari AI Works

Monorepo: **Next.js portfolio** + **FastAPI API** + **Firebase Firestore**, structured like a polyglot `apps/` + `packages/` workspace. Deploy on **one server** (single port) or split hosts if you prefer.

```text
Hari-AI-Works/
  apps/
    web/              # Next.js UI + admin
    api/              # FastAPI + Firebase Admin
  packages/
    web-config/       # Shared BACKEND_URL helpers
  docs/
    ARCHITECTURE.md   # ← start here for layout + hosting
```

## Prerequisites

- Node 20+
- pnpm 9 (`corepack enable`)
- Python 3.11+ and [uv](https://github.com/astral-sh/uv)

## Quick start

```bash
pnpm sync

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

pnpm dev
```

- Site: http://localhost:5173  
- API docs: http://127.0.0.1:8000/docs  
- Admin: http://localhost:5173/admin  

## Single-server production

```bash
pnpm build
pnpm start          # API (internal :8000) + web (public :3000)

# or Docker
docker compose up --build
```

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full layout, env vars, and deployment options.

## Docs

| Doc | Path |
|-----|------|
| **Architecture & hosting** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Auth | [docs/AUTH.md](docs/AUTH.md) |
| Firebase | [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) |
| API | [apps/api/README.md](apps/api/README.md) |
