# Implementation Guide

Hari AI Works is a **pnpm monorepo** with a **Python FastAPI backend** and a **render-only Next.js frontend**.

## 1. Goals

| Goal | Approach |
|------|----------|
| No Next.js business backend | All APIs in `apps/api/` (FastAPI) |
| No secrets in frontend | Firebase Admin + admin password only in Python `.env` |
| Frontend only renders | Views paint `PortfolioPayload` from `GET /api/portfolio` |
| Fixed visual design | CSS variables in `apps/web/src/app/globals.css` (not DB) |
| Package manager | **pnpm** workspaces + **uv** for Python |

## 2. Architecture

```text
Browser
  └─ Next.js (apps/web/)  — UI only
        │  rewrite /api/* 
        ▼
  FastAPI (apps/api/)       — auth, Firestore, seed, CMS
        ▼
  Firestore (Admin SDK)
```

Same-origin `/api/*` via Next rewrites keeps httpOnly cookies working.

## 3. Packages

| Path | Role |
|------|------|
| `apps/api/` | FastAPI, Firebase Admin, JWT session, seed, CMS APIs |
| `apps/web/` | Next.js App Router UI + admin forms calling `/api/*` |
| `docs/` | Setup guides |

## 4. API surface (Python)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | Public |
| GET | `/api/portfolio` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Cookie |
| GET | `/api/auth/me` | Cookie |
| CRUD | `/api/admin/*` | Cookie |

## 5. Frontend rules

- No `firebase-admin`, no resume hardcoding in views
- Visual tokens live in `globals.css` (not from API payload)
- `BACKEND_URL` for RSC fetches; browser uses `/api` (rewrite)

## 6. Local run

```bash
pnpm api:sync
pnpm dev:api          # :8000
pnpm install
pnpm dev:web          # :5173
# or: pnpm dev
```

## 7. Experience dates

Computed in Python (`app/domain/experience.py`) from `startDate` / `endDate` vs today → `experienceSummary.totalLabel`.

## 8. Admin

1. Set `ADMIN_SETUP_KEY` / `SESSION_SECRET` in `apps/api/.env`
2. Configure Firebase service account (optional until seed)
3. `/admin` → face/magic login → Seed → edit content
