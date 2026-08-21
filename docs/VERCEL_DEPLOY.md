# Vercel Hosting Guide (optional split deploy)

> **Recommended:** deploy web + API on **one server** with Docker or `pnpm start`. See [ARCHITECTURE.md](./ARCHITECTURE.md).

This guide is for hosting Next.js on Vercel while the API runs on a separate Python host.

## 1. Prerequisites

- GitHub/GitLab/Bitbucket repo with this monorepo
- Firebase setup complete ([FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
- Local `pnpm build` + FastAPI health check succeed

## 2. Create a Vercel project (frontend)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import the repository
3. Framework preset: **Next.js**
4. **Root Directory:** `apps/web`
5. Build: `pnpm install` at repo root may need install command:
   - Install Command: `cd .. && pnpm install --filter portfolio...` **or** set root to monorepo and override
   - Simpler: Root Directory `portfolio`, Install `pnpm install` (with `packageManager` in root — prefer importing with Root `portfolio` and copying pnpm-lock)
6. Env for web:
   - `BACKEND_URL` = public URL of your Python API (e.g. `https://api.yourdomain.com`)

Do **not** put Firebase service account keys in Vercel frontend env.

## 3. Host the Python API

Deploy `apps/api/` to a Python host (Railway, Render, Fly.io, Cloud Run, etc.):

1. Start command: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. Set server env from `apps/api/.env.example` (`FIREBASE_*`, `ADMIN_*`, `SESSION_SECRET`, `CORS_ORIGINS`, `COOKIE_SECURE=true`)
3. `CORS_ORIGINS` must include your Vercel URL
4. Point Vercel `BACKEND_URL` at this API

Next rewrites proxy `/api/*` → `BACKEND_URL` so the browser stays on the Vercel origin for cookies when the rewrite target sets `Set-Cookie` correctly. If cookies fail behind a separate API domain, set `NEXT_PUBLIC_API_BASE` to the API URL and configure CORS + `SameSite=None; Secure` cookies.

Do **not** finish deploy until env vars are set (or the first build may fail Admin init).

## 3. Environment variables (server-only)

In Vercel → Project → **Settings** → **Environment Variables**, add:

| Name | Notes |
|------|--------|
| `FIREBASE_PROJECT_ID` | From service account JSON |
| `FIREBASE_CLIENT_EMAIL` | From service account JSON |
| `FIREBASE_PRIVATE_KEY` | Full key; keep `\n` escapes; quote if UI requires |
| `ADMIN_EMAIL` | Your admin login email |
| `ADMIN_PASSWORD` | Strong password |
| `SESSION_SECRET` | Long random string (32+ chars) |

### Critical settings

- Apply to **Production**, **Preview**, and **Development** as needed
- **Do not** enable any “Expose to Browser” / Client exposure
- **Never** add `NEXT_PUBLIC_FIREBASE_*` for this architecture

### Private key tip on Vercel

Paste the key as a single line with `\n` between PEM lines, same as `.env.local`. If Vercel mangles newlines, use the quoted form from the Firebase setup doc.

## 4. Deploy

1. Save env vars
2. **Deployments** → **Redeploy** (or push a commit)
3. Wait for build success
4. Open the deployment URL

## 5. Post-deploy configuration

1. Visit `https://your-app.vercel.app/admin`
2. Login with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. Run **Seed defaults** (first time)
4. Open `/` and verify portfolio content
5. Set Spline URL under Site settings if needed

## 6. Custom domain (optional)

1. Vercel → Project → **Settings** → **Domains**
2. Add domain → follow DNS instructions
3. Wait for SSL
4. Update any absolute URLs you stored in content (if any)

## 7. Preview deployments

Every PR/branch gets a Preview URL. Ensure Preview env has the same Firebase/admin vars if you need CMS testing on previews. Use a separate Firebase project for previews if you want isolation.

## 8. Production checklist

- [ ] `next build` green on Vercel
- [ ] `/` loads content from Firestore
- [ ] `/api/portfolio` returns JSON (no stack traces)
- [ ] `/admin` login works; cookie is **HttpOnly**
- [ ] Unauthenticated `POST /api/admin/*` returns 401
- [ ] Firestore rules deny browser clients
- [ ] No Firebase secrets in client bundle (search built JS for `BEGIN PRIVATE KEY` — must be absent)

## 9. Operational tips

| Topic | Practice |
|-------|----------|
| Rotating admin password | Change `ADMIN_PASSWORD` on Vercel → redeploy (or restart) |
| Rotating service account | Generate new key → update three Firebase env vars → redeploy → revoke old key |
| Cold starts | First Admin init may be slightly slower; singleton in `lib/firebase/admin.ts` helps |
| Caching | Prefer short cache or `no-store` on `/api/portfolio` while editing content often |

## 10. Rollback

Vercel → Deployments → previous successful deployment → **Promote to Production**.

## 11. Related docs

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — architecture and payload
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) — project + service account + rules
- [README.md](./README.md) — doc index
