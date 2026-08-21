# Deploy on Render (single Docker service)

One Render **Web Service** runs Next.js + FastAPI together (root `Dockerfile`).  
Firebase is used only for **Firestore** (keep your existing project).

## 1. Push this repo to GitHub

Your remote is already `https://github.com/Harii0024/Portfolio.git`.

```powershell
cd D:\Hari-AI-Works
git add render.yaml apps/web/package.json apps/api/Dockerfile apps/api/.dockerignore docs/RENDER_DEPLOY.md
git commit -m "Add Render single-service Docker deploy"
git push origin main
```

## 2. Create the service on Render

1. Open [dashboard.render.com](https://dashboard.render.com) → sign up with GitHub  
2. **New** → **Blueprint** (uses `render.yaml`)  
   - Or **New** → **Web Service** → connect `Harii0024/Portfolio`  
3. Settings if not using Blueprint:
   - **Runtime:** Docker  
   - **Dockerfile path:** `./Dockerfile`  
   - **Instance type:** Free  
   - **Region:** Singapore (or closest)

## 3. Environment variables

In the service → **Environment**, add (copy from local `apps/api/.env`):

| Key | Value |
|-----|--------|
| `FIREBASE_PROJECT_ID` | from service account |
| `FIREBASE_CLIENT_EMAIL` | from service account |
| `FIREBASE_PRIVATE_KEY` | full key with `\n` (same as `.env`) |
| `ADMIN_SETUP_KEY` | your setup key |
| `SESSION_SECRET` | long random string (32+) |
| `FRONTEND_URL` | `https://YOUR-SERVICE.onrender.com` |
| `CORS_ORIGINS` | `https://YOUR-SERVICE.onrender.com` |
| `COOKIE_SECURE` | `true` |
| `ENVIRONMENT` | `production` |
| `BACKEND_URL` | `http://127.0.0.1:8000` |
| `API_PORT` | `8000` |

After the first deploy, Render shows the public URL — set `FRONTEND_URL` and `CORS_ORIGINS` to that URL, then **Manual Deploy**.

Do **not** put Firebase keys in the Next.js / browser env.

## 4. Deploy

Click **Deploy**. First build can take several minutes (pnpm + Next build + Python deps).

When live, open:

- Site: `https://YOUR-SERVICE.onrender.com`  
- Health: `https://YOUR-SERVICE.onrender.com/api/health` → `"firebase": true`

## 5. First-time admin (if needed)

If production Firestore already has `admins/primary`, just use face login.  
Otherwise open `/admin`, enter `ADMIN_SETUP_KEY`, enroll face, then **Seed defaults**.

## Notes

- Free tier **spins down** after idle; first request after sleep can take ~30–60s.  
- Custom domain: Render → service → **Settings** → **Custom Domains**, then update `FRONTEND_URL` / `CORS_ORIGINS`.  
- Local Docker equivalent: `pnpm docker:up`
