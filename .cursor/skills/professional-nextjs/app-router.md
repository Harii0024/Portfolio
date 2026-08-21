# App Router

## File conventions

| File | Role |
|------|------|
| `layout.tsx` | Shared UI shell; preserve state on navigation |
| `page.tsx` | Unique UI for a route segment |
| `loading.tsx` | Instant loading UI (Suspense boundary) |
| `error.tsx` | Segment error boundary (`"use client"` required) |
| `not-found.tsx` | 404 UI |
| `template.tsx` | Remounts on navigation (rare) |
| `default.tsx` | Parallel route fallback |
| `route.ts` | HTTP handler (GET/POST/…) |
| `middleware.ts` | Edge gate for auth redirects, headers (keep light) |

## Route organization

- Use route groups `(name)` for layouts without URL segments.
- Use private folders `_lib` / `_components` for colocated non-routes.
- Prefer colocated components next to the route when they are route-specific.
- Keep shared components in `components/`.

```text
app/
  (marketing)/
    layout.tsx
    page.tsx
  (dashboard)/
    layout.tsx
    settings/
      page.tsx
      loading.tsx
```

## Layouts

- Layouts should be lean: nav, providers, fonts — not heavy data that blocks all children unless required.
- Auth-aware layouts may gate children, but still enforce authz in actions/data loaders.
- Do not nest unnecessary client providers high in the tree; push them down.

## Metadata

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account",
};

// or dynamic:
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getItem(params.id);
  return { title: item.name };
}
```

## Navigation

- Use `next/link` for internal links.
- Use `redirect` / `notFound` from `next/navigation` in Server Components/Actions.
- Use `useRouter` only in Client Components.

## Route Handlers

```ts
// app/api/health/route.ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true });
}
```

Use Route Handlers for:

- Webhooks, third-party callbacks
- Public/programmatic HTTP APIs
- Binary streaming responses

Prefer Server Actions for first-party UI mutations inside the app.

## Middleware guidance

- Keep middleware fast and simple (session cookie check, redirects, headers).
- Do not put heavy DB business logic in middleware.
- Pair middleware redirects with server-side auth checks (defense in depth).

## Parallel & intercepting routes

Use when the product UX needs modals/parallel panels. Do not introduce them for simple pages — complexity cost is high.
