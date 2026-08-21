# Auth: Face + Magic link

No passwords. No Redis. **Firestore only** (plus optional SMTP for email).

## First-time setup

1. `.env`: `ADMIN_SETUP_KEY=...` + Firebase Admin credentials
2. `/admin` popup: setup key + email (email saved in DB)
3. Capture face → `admins/primary` = `{ email, faceDescriptor }`

## Face login

Match descriptor in Firestore → session cookie.

## Magic link (Firestore)

1. User enters email
2. Lookup admin by email in Firestore
3. Store one-time token in `magicLinks/{token}` with `expiresAt`
4. Browser binding cookie + email link
5. Verify deletes the token doc (one-time use)

No Upstash/Redis required.
