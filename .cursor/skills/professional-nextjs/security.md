# Next.js Security

## Environment variables

| Kind | Prefix | Exposure |
|------|--------|----------|
| Secret | no prefix | Server only |
| Public | `NEXT_PUBLIC_` | Bundled to client |

- Never put API keys, DB URLs, or private tokens in `NEXT_PUBLIC_*`.
- Do not commit `.env.local`. Provide `.env.example` with placeholders.

## AuthN / AuthZ

- Verify session/user in Server Actions, Route Handlers, and sensitive RSC data loaders.
- Middleware redirects are UX helpers, not the only security control.
- Enforce object-level authorization (user can only mutate their resources).

```ts
"use server";

export async function deleteItemAction(itemId: string) {
  const user = await requireUser();
  const item = await getItem(itemId);
  if (!item || item.userId !== user.id) {
    throw new Error("Forbidden");
  }
  await deleteItem(itemId);
}
```

## XSS

- React escapes JSX text by default — keep it that way.
- Avoid `dangerouslySetInnerHTML` unless sanitized (e.g. strict allowlist HTML sanitizer).
- Be careful with `href`/`src` from users (`javascript:` URLs).

## CSRF / Server Actions

- Prefer framework built-in protections for same-origin Server Actions.
- For custom Route Handler mutations from browsers, use same-site cookies + origin checks / CSRF tokens as appropriate.
- Validate `Origin`/`Host` for sensitive cookie-based POST APIs when building custom endpoints.

## Headers

Prefer security headers via `next.config` or middleware when appropriate:

- `Content-Security-Policy` (tighten iteratively)
- `X-Frame-Options` / `frame-ancestors`
- `Referrer-Policy`
- `Permissions-Policy`

## Cookies

Session cookies should be:

- `HttpOnly`
- `Secure` (production)
- `SameSite=Lax` or `Strict` as UX allows

## Dependency & upload safety

- Validate file type/size server-side for uploads; store outside public web root when possible.
- Do not trust client-provided Content-Type alone.
- Keep Next.js and React updated for security patches.

## Logging

- Log request IDs / user IDs, not raw tokens or passwords.
- Avoid dumping full form payloads that may contain PII into client-visible errors.
