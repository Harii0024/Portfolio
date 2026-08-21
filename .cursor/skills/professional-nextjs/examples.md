# Next.js Examples

## Bad vs good: initial data

```tsx
// ❌ BAD — client waterfalls for first paint
"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then(setItems);
  }, []);
  return <ul>{/* ... */}</ul>;
}

// ✅ GOOD — server fetch
import { getItems } from "@/lib/items";

export default async function Page() {
  const items = await getItems();
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

## Bad vs good: client boundary

```tsx
// ❌ BAD — entire page is client because of one button
"use client";
export default function Page() {
  return (
    <main>
      <h1>Projects</h1>
      <button onClick={() => alert("ok")}>Share</button>
    </main>
  );
}

// ✅ GOOD — client island only
import { ShareButton } from "./share-button";

export default function Page() {
  return (
    <main>
      <h1>Projects</h1>
      <ShareButton />
    </main>
  );
}
```

## Server Action + form

```tsx
// actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createProject } from "@/lib/projects";

const schema = z.object({ name: z.string().min(1).max(80) });

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Name is required" };

  await createProject({ name: parsed.data.name, userId: user.id });
  revalidatePath("/projects");
  return { error: null };
}
```

```tsx
// page.tsx (server)
import { createProjectAction } from "./actions";

export default function ProjectsPage() {
  return (
    <form action={createProjectAction}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Route Handler

```ts
// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/projects";

export async function GET() {
  const user = await requireUser();
  const projects = await listProjects(user.id);
  return NextResponse.json({ projects });
}
```

## Typed page params (App Router)

```tsx
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function ProjectPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { q } = await searchParams;
  // ...
}
```

> Note: Match the Next.js version in the repo for `params` sync vs `Promise` typing.
