# Components and Data

## Server Components (default)

```tsx
// app/items/page.tsx
import { getItems } from "@/lib/items";
import { ItemList } from "@/components/item-list";

export default async function ItemsPage() {
  const items = await getItems();
  return <ItemList items={items} />;
}
```

Rules:

- `async` Server Components may await data directly.
- Pass serializable props to Client Components.
- Do not import server-only modules (DB clients, private env) into client files.

## Client Components (islands)

```tsx
"use client";

import { useState } from "react";

export function LikeButton({ id }: { id: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <button type="button" onClick={() => setLiked(true)} aria-pressed={liked}>
      {liked ? "Liked" : "Like"}
    </button>
  );
}
```

Add `"use client"` when you need:

- `useState`, `useEffect`, `useRef`, and most interactive hooks
- Browser-only APIs (`window`, `localStorage`)
- Event handlers (`onClick`, `onChange`)
- Libraries that require the client

Pattern: server parent fetches → client child handles interaction.

## Data fetching

| Goal | Approach |
|------|----------|
| Static / ISR | `fetch(url, { next: { revalidate: 60 } })` |
| Always fresh | `fetch(url, { cache: "no-store" })` |
| Tag revalidation | `fetch(url, { next: { tags: ["items"] } })` + `revalidateTag("items")` |
| DB access | Server-only `lib/` module called from RSC/Action |

Avoid:

- Fetching the same initial data in `useEffect` on page load
- Duplicating server fetches in client state without need

## Server Actions

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createItem } from "@/lib/items";

const schema = z.object({
  title: z.string().min(1).max(100),
});

export async function createItemAction(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({
    title: formData.get("title"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid title" };
  }

  await createItem({ title: parsed.data.title, userId: user.id });
  revalidatePath("/items");
  return { ok: true as const };
}
```

Rules:

- `"use server"` at file top or above exported async functions.
- Validate every input.
- Authorize every mutation.
- Return serializable results; revalidate paths/tags after writes.

## Forms

Prefer progressive enhancement:

```tsx
import { createItemAction } from "./actions";

export function NewItemForm() {
  return (
    <form action={createItemAction}>
      <label htmlFor="title">Title</label>
      <input id="title" name="title" required maxLength={100} />
      <button type="submit">Create</button>
    </form>
  );
}
```

For complex client UX, use `useFormStatus` / `useActionState` (or project form library) on a small client wrapper.

## Composition patterns

- **Container (server) + presentational (shared/client)** for interactive lists.
- Lift client boundaries down so static text/layout remain server-rendered.
- Share types between server loaders and components via `types/`.

## Performance

- Dynamic import heavy client widgets: `next/dynamic`.
- Use `next/image` with sizing; avoid huge unoptimized assets.
- Stream with `loading.tsx` / `<Suspense>` for slow segments.
- Minimize client bundle: check unexpected `"use client"` at high tree levels.
