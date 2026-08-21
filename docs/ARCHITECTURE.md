# Hari AI Works — Architecture

Monorepo for a personal portfolio CMS: public site, admin dashboard, FastAPI backend, and Firebase Firestore. Designed like the LDPP polyglot layout (`apps/` + `packages/`) and deployable on **one server / one port** — no separate Vercel + Railway setup required.

---

## Table of Contents

1. [Repository layout](#repository-layout)
2. [Runtime architecture](#runtime-architecture)
3. [Single-server hosting](#single-server-hosting)
4. [pnpm workspace](#pnpm-workspace)
5. [Python / uv workspace](#python--uv-workspace)
6. [Environment variables](#environment-variables)
7. [Local development](#local-development)
8. [Production deployment](#production-deployment)
9. [Security model](#security-model)
10. [Related docs](#related-docs)

---

## Repository layout

```text
Hari-AI-Works/                         ← monorepo root
│
├── apps/
│   ├── web/          → Next.js 16 portfolio + admin UI     (TypeScript, pnpm)
│   └── api/          → FastAPI REST API + Firebase Admin     (Python, uv)
│
├── packages/
│   └── web-config/   → Shared server URL helpers             (TypeScript, pnpm workspace)
│
├── scripts/
│   └── start-prod.mjs → Starts API + web on one machine (single-server mode)
│
├── docs/             → Setup guides (Firebase, auth, legacy Vercel notes)
├── Dockerfile        → One container: web (public) + API (internal)
├── docker-compose.yml
│
├── package.json      → Root pnpm scripts (`dev`, `build`, `start`, `sync`)
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── pyproject.toml    → uv workspace root (member: apps/api)
├── .npmrc
└── README.md
```

| Concern | Tool | Config |
|--------|------|--------|
| TypeScript / Node.js | **pnpm** | `pnpm-workspace.yaml` |
| Python API | **uv** | `apps/api/pyproject.toml`, root `pyproject.toml` |
| Data | **Firebase Firestore** | `apps/api/.env` service account |

This mirrors the LDPP pattern from `arc.md`: `apps/*` for deployable apps, `packages/*` for shared TS code, dual lockfiles (`pnpm-lock.yaml` + `apps/api/uv.lock`).

---

## Runtime architecture

```text
                    ┌─────────────────────────────────────┐
                    │         Single server / VM          │
                    │         (one public port: 3000)     │
                    └─────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │         Next.js (@hari/web)       │
                    │  • Public site + /admin           │
                    │  • Rewrites /api/* → internal API │
                    └─────────────────┬─────────────────┘
                                      │ http://127.0.0.1:8000
                    ┌─────────────────┴─────────────────┐
                    │         FastAPI (apps/api)          │
                    │  • Auth (face + magic link)       │
                    │  • CMS CRUD + seed                │
                    │  • Portfolio JSON                 │
                    └─────────────────┬─────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │      Firebase Firestore           │
                    │  (browser never talks to Firebase)│
                    └───────────────────────────────────┘
```

**Important:** The browser only talks to the Next.js origin. All `/api/*` calls are rewritten to the local FastAPI process. HttpOnly session cookies stay same-origin — no cross-domain cookie issues.

---

## Single-server hosting

### Why one server?

Previously you needed:

- Vercel → Next.js  
- Railway/Render → FastAPI  

Now both processes run on the **same machine**:

| Process | Bind address | Visible to internet? |
|---------|--------------|----------------------|
| Next.js | `0.0.0.0:3000` | Yes (only public port) |
| FastAPI | `127.0.0.1:8000` | No (internal only) |

### How it works

1. `scripts/start-prod.mjs` starts FastAPI on `127.0.0.1:8000`.
2. Next.js starts on `PORT` (default `3000`) with `BACKEND_URL=http://127.0.0.1:8000`.
3. `apps/web/next.config.ts` rewrites `/api/:path*` → `${BACKEND_URL}/api/:path*`.
4. Admin cookies and face auth work because the browser sees one origin.

### Commands

```bash
# Build web + install deps
pnpm sync
pnpm build

# Production (one command, one server)
pnpm start

# Docker (recommended for VPS / single VM)
docker compose up --build
# → http://localhost:3000
```

---

## pnpm workspace

### Workspace packages

| Package | Path | Role |
|---------|------|------|
| `@hari/web` | `apps/web` | Next.js UI |
| `@hari/web-config` | `packages/web-config` | `BACKEND_URL`, port defaults |

### Root scripts

| Script | What it does |
|--------|----------------|
| `pnpm dev` | Web (5173) + API (8000) concurrently |
| `pnpm dev:web` | Next.js dev only |
| `pnpm dev:api` | FastAPI reload only |
| `pnpm build` | Production Next.js build |
| `pnpm start` | **Single-server** API + web |
| `pnpm sync` | `pnpm install` + `uv sync` |
| `pnpm docker:up` | Docker Compose single container |

### Workspace dependency example

```json
// apps/web/package.json
{
  "dependencies": {
    "@hari/web-config": "workspace:*"
  }
}
```

---

## Python / uv workspace

```bash
# Install API dependencies
uv sync --directory apps/api

# Run API alone (dev)
pnpm dev:api
```

API code lives in `apps/api/app/`. Firestore seed content in `apps/api/app/seed/`.

---

## Environment variables

### API — `apps/api/.env`

Copy from `apps/api/.env.example`:

| Variable | Purpose |
|----------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project |
| `FIREBASE_CLIENT_EMAIL` | Service account |
| `FIREBASE_PRIVATE_KEY` | Service account key |
| `SESSION_SECRET` | JWT signing (32+ chars) |
| `ADMIN_SETUP_KEY` | First-time face enroll |
| `FRONTEND_URL` | Public site URL (e.g. `https://yoursite.com`) |
| `CORS_ORIGINS` | Same as public URL |
| `COOKIE_SECURE` | `true` in production HTTPS |
| `SMTP_*` | Magic-link email (optional) |

### Web — `apps/web/.env.local` (dev only)

| Variable | Purpose |
|----------|---------|
| `BACKEND_URL` | Server-side fetch target (default `http://127.0.0.1:8000`) |

In **single-server production**, set `BACKEND_URL=http://127.0.0.1:8000` inside the container (Dockerfile does this automatically).

---

## Local development

```bash
# 1) Install
pnpm sync

# 2) Configure
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3) Run both (two processes, same as before)
pnpm dev
```

- Site: http://localhost:5173  
- API docs: http://127.0.0.1:8000/docs  
- Admin: http://localhost:5173/admin  

Dev uses port **5173** for web; production uses **3000**.

---

## Production deployment

### Option A — Docker (recommended)

```bash
cp apps/api/.env.example apps/api/.env
# Edit Firebase + SESSION_SECRET + FRONTEND_URL

docker compose up --build -d
```

Expose port **3000** on your VPS. Put Caddy/nginx in front for HTTPS if needed.

### Option B — Bare metal / VPS

```bash
pnpm sync
pnpm build
# set apps/api/.env and export BACKEND_URL=http://127.0.0.1:8000
pnpm start
```

Use **systemd** or **pm2** to keep `pnpm start` running.

### Option C — Split hosting (legacy)

You can still deploy web and API separately (Vercel + Railway) using `BACKEND_URL` pointing at the external API. See [docs/VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md). The monorepo structure does not require split hosting.

---

## Security model

- Firebase Admin credentials live **only** in `apps/api/.env` (server).
- Browser never receives Firestore credentials.
- Admin session = signed JWT in httpOnly cookie (`hari_admin_session`).
- Face login + magic link; no password storage.
- API on `127.0.0.1` in single-server mode is not reachable from outside the host.

---

## Related docs

| Doc | Topic |
|-----|--------|
| [AUTH.md](./AUTH.md) | Face + magic link auth |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Firestore + service account |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | CMS payload shapes |
| [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) | Optional split deploy |

---

## Migration note (folder moves)

| Old path | New path |
|----------|----------|
| `portfolio/` | `apps/web/` |
| `backend/` | `apps/api/` |
| `pnpm --filter portfolio` | `pnpm --filter @hari/web` |
| `uv run --directory backend` | `uv run --directory apps/api` |

Update any local scripts or CI paths accordingly.
