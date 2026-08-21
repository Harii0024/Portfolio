# Portfolio (Next.js — render only)

UI for Hari AI Works. **All business logic lives in `../backend` (FastAPI).**

## Dev

From repo root:

```bash
pnpm install
pnpm dev:api   # Python :8000
pnpm dev:web   # Next :5173
```

`BACKEND_URL` in `.env.local` must point at the API. Browser calls `/api/*` which Next **rewrites** to the Python service.

## Do not add

- Firebase client/admin SDKs
- Resume content hardcoding in components
- Next.js Route Handlers for CMS/portfolio
