---
name: professional-nextjs
description: >-
  Professional Next.js (App Router) engineering standards covering Server
  Components, Server Actions, routing, data fetching, TypeScript/React patterns,
  performance, testing, and security. Use when building or refactoring Next.js
  apps, React Server Components, route handlers, middleware, or Next.js UI/API
  code.
---

# Professional Next.js

Apply for App Router Next.js work (React + TypeScript) unless the repo already defines conflicting conventions.

## Quick checklist

- [ ] Server Components by default; `"use client"` only when required
- [ ] Initial data loaded on the server (not `useEffect` fetch-on-mount)
- [ ] Secrets stay server-side (`NEXT_PUBLIC_*` only for intentional public values)
- [ ] Mutations via Server Actions or Route Handlers with authz checks
- [ ] Types are strict; no unjustified `any`
- [ ] Loading / empty / error states for async UI
- [ ] Images via `next/image` when serving meaningful media
- [ ] Accessibility: labels, keyboard focus, semantic HTML

## Non-negotiables

1. **RSC first** — push client JS to the leaves.
2. **Explicit caching** — know whether data is static, revalidated, or dynamic.
3. **Typed boundaries** — props, actions, and API payloads are typed.
4. **Authz on the server** — never rely on hidden UI alone.
5. **Match the repo** — follow existing folder aliases, UI library, and data layer.

## Default preferences

| Concern | Prefer |
|---------|--------|
| Router | App Router (`app/`) |
| Language | TypeScript strict |
| Styling | Match repo (CSS Modules / Tailwind / etc.) |
| Mutations | Server Actions for app mutations; Route Handlers for public HTTP APIs |
| Validation | Zod (or repo standard) at boundaries |
| Testing | Vitest/Jest + React Testing Library; Playwright for e2e |

## Folder conventions (typical)

```text
app/
  (marketing)/
  (app)/
    layout.tsx
    page.tsx
    api/<resource>/route.ts
  actions/
components/          # shared UI (mark client only when needed)
lib/                 # server utilities, db, auth
hooks/               # client hooks
types/
public/
```

## Decision tree: client vs server

```text
Needs hooks, browser events, or browser-only APIs?
  YES → Client Component (smallest leaf possible)
  NO  → Server Component

Needs secret env / DB / privileged fetch?
  → Server Component, Server Action, or Route Handler only
```

## Workflow

1. Inspect existing `app/` structure, data library, and auth pattern.
2. Implement with RSC/data layer first; add client islands for interactivity.
3. Validate inputs in actions/handlers; enforce authz.
4. Add tests for non-trivial logic and critical UI states.
5. Verify build-relevant constraints (server/client imports) before finishing.

## Progressive disclosure

- [app-router.md](app-router.md) — routing, layouts, metadata, navigation
- [components-and-data.md](components-and-data.md) — RSC, client islands, fetching, actions
- [testing-and-quality.md](testing-and-quality.md) — unit, component, e2e
- [security.md](security.md) — auth, CSRF, headers, env, XSS
- [examples.md](examples.md) — concrete good/bad patterns
