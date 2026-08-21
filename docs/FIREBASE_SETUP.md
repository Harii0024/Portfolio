# Firebase Setup Guide (Python backend)

Firebase is used **only by the FastAPI backend** via the Admin SDK.  
The Next.js app never talks to Firebase directly (no `NEXT_PUBLIC_FIREBASE_*`).

What gets stored in Firestore:
- Portfolio content (profile, experience, projects, …)
- Admin record `admins/primary` (`email` + `faceDescriptor`)

---

## Step 1 — Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/)
2. **Add project** → name it (e.g. `hari-ai-works`)
3. Google Analytics: optional
4. Create / open the project

---

## Step 2 — Create Firestore (required)

Service-account credentials alone are not enough. If you skip this step, face login
fails with `404 The database (default) does not exist for project …`.

1. Left menu → **Build** → **Firestore Database**
2. **Create database**
3. Choose **Native mode** (not Datastore mode)
4. Mode: **Production**
5. Region: e.g. `asia-south1` (India) or closest to you
6. Enable and wait until the console shows an empty database

Direct link (replace project id if needed):
`https://console.firebase.google.com/project/hari-ai-works/firestore`

You do **not** need Firebase Authentication for this app (auth is face + magic link in FastAPI).

---

## Step 3 — Deny all client access (rules)

Firestore → **Rules** → paste → **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Only the Python Admin SDK (service account) can read/write.

Repo copy: `apps/web/firestore.rules` (same rules).

---

## Step 4 — Create a service account key

1. Project settings (gear) → **Service accounts**
2. **Generate new private key** → download the JSON
3. Keep it **out of git**

From the JSON, copy into `apps/api/.env`:

| JSON field | Put in `apps/api/.env` as |
|------------|---------------------------|
| `project_id` | `FIREBASE_PROJECT_ID` |
| `client_email` | `FIREBASE_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_PRIVATE_KEY` |

### How to paste the private key

Keep quotes and use `\n` for newlines:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...full key...\n-----END PRIVATE KEY-----\n"
```

Also set (non-Firebase but required):

```env
ADMIN_SETUP_KEY=hari-setup-7k
SESSION_SECRET=some-long-random-string-at-least-32-chars
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

---

## Step 5 — Restart the API

```powershell
cd d:\Hari-AI-Works
pnpm api:sync
pnpm dev:api
```

Check health:

- Open http://127.0.0.1:8000/api/health  
- You want `"firebase": true`

---

## Step 6 — Start the web app

```powershell
cd d:\Hari-AI-Works
pnpm install
pnpm dev:web
```

- Site: http://localhost:5173  
- Admin: http://localhost:5173/admin  

---

## Step 7 — First-time admin (writes to Firebase)

1. Open `/admin`
2. Popup: enter `ADMIN_SETUP_KEY` + your email (stored in DB)
3. Capture face → creates Firestore doc:

```text
admins/primary
  email: you@...
  faceDescriptor: [128 floats]
  role: admin
```

4. Later logins: face match against that doc (or magic link email checked against DB)

---

## Step 8 — Seed portfolio content into Firebase

While logged into admin dashboard:

1. Open **Seed** tab
2. Click **Seed defaults**
3. In Firebase Console → Firestore, you should see:

```text
portfolio/profile
experiences/...
education/...
skillGroups/...
projects/...
siteSettings/main
admins/primary
```

(Styling is frontend-only — there is no `themes` collection.)
Public site `GET /api/portfolio` should then show `"source": "firestore"`.

---

## Step 9 — Confirm it worked

| Check | Expected |
|-------|----------|
| `/api/health` | `"firebase": true` |
| Firestore Console | collections appear after seed / face enroll |
| `/` portfolio | live content (not only seed fallback) |
| Face login again | works without setup key |

---

## Security checklist

- [ ] Service account JSON not committed
- [ ] `apps/api/.env` in `.gitignore`
- [ ] No `NEXT_PUBLIC_FIREBASE_*` in the frontend
- [ ] Firestore rules = deny all clients
- [ ] Strong `ADMIN_SETUP_KEY` and `SESSION_SECRET`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `"firebase": false` | Missing/empty `FIREBASE_*` in `apps/api/.env`; restart API |
| Private key error | Quotes + `\n` newlines; copy full PEM from JSON |
| Permission denied | Wrong project / regenerated key not updated in `.env` |
| Still seeing seed data | Profile missing → run **Seed** in admin |
| Face enroll fails | `ADMIN_SETUP_KEY` must match `.env` exactly |
| Magic link “No admin found” | Email must match `admins/primary.email` from setup |
