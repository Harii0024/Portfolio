# Hari AI Works — Portfolio Documentation Index

Structured docs for the Firebase-backed Next.js portfolio (FastAPI CMS).

| Document | Purpose |
|----------|---------|
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Architecture, folder map, data flow |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Create Firebase project, service account, Firestore, rules, seed |
| [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) | Host on Vercel, server-only env vars, domains, checklist |

## Product summary

App layout: [`apps/api/`](../apps/api/) (FastAPI) + [`apps/web/`](../apps/web/) (Next.js UI). See [ARCHITECTURE.md](./ARCHITECTURE.md) for single-server hosting.

- **Public site:** render-only UI from Python `GET /api/portfolio` (content only; styles in CSS).
- **Admin:** `/admin` → CMS; mutations hit Python `/api/admin/*` (httpOnly cookie).
- **Backend:** FastAPI + Firebase Admin SDK only (no Firebase in the browser).
- **Package managers:** pnpm (web) + uv (Python).
- **Hero:** Spline scene URL from DB; UI motion via Motion.
- **Experience:** durations computed in Python from job dates.

## Security baseline

- No `NEXT_PUBLIC_FIREBASE_*`
- Firestore client rules: deny all
- Admin session: httpOnly cookie
- Secrets: `.env.local` / Vercel server env only
