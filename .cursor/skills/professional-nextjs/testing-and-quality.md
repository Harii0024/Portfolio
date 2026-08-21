# Next.js Testing and Quality

## Layers

| Layer | Tools (typical) | What to cover |
|-------|-----------------|---------------|
| Unit | Vitest / Jest | pure lib functions, validators, mappers |
| Component | RTL | interactive client widgets, accessibility roles |
| Integration | RTL + server helpers | actions with mocked DB/auth |
| E2E | Playwright | critical user journeys |

Match the repo's existing test runner.

## Unit test

```ts
import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("normalizes titles", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
});
```

## Component test

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LikeButton } from "./like-button";

test("toggles liked state", async () => {
  const user = userEvent.setup();
  render(<LikeButton id="1" />);
  await user.click(screen.getByRole("button", { name: /like/i }));
  expect(screen.getByRole("button", { name: /liked/i })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
```

## Server Action testing

- Extract domain/db calls into `lib/` so actions stay thin and testable.
- Mock `requireUser` / repository modules.
- Assert validation failures and auth failures return controlled results (not thrown HTML unless intentional).

## E2E priorities

1. Auth login/logout (if present)
2. Primary create/update/delete flows
3. Permission denied paths
4. Critical landing/marketing CTA only if business-critical

## Quality checklist

- Typecheck: `tsc --noEmit` (or `next build`)
- Lint: project ESLint config (`eslint-config-next`)
- No server-only imports in client components
- No hardcoded secrets
- Key pages have loading and error UI where UX needs them

## Accessibility baseline

- Prefer semantic elements (`button`, `a`, `label`, headings)
- Every input has an associated label
- Icon-only buttons have accessible names
- Do not remove focus outlines without a visible replacement

## Anti-patterns

- Snapshot-only tests with no behavior assertions
- E2E for pure unit logic
- Disabling ESLint rules broadly instead of fixing violations
- Testing implementation details (internal state) instead of user-visible behavior
