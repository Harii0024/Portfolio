---
name: professional-python
description: >-
  Professional Python engineering standards covering architecture, typing,
  APIs, async, testing, packaging, and security. Use when writing, reviewing,
  refactoring, or designing Python code, FastAPI/Django/Flask services,
  scripts, packages, pytest suites, or Python project structure.
---

# Professional Python

Apply these standards for all Python work unless the existing project explicitly contradicts them.

## Quick checklist

Before finishing Python changes:

- [ ] Public APIs are typed; no bare `Any` without justification
- [ ] Domain logic isolated from frameworks and I/O
- [ ] Errors are specific and handled at the right layer
- [ ] Inputs validated at boundaries (Pydantic / annotated types)
- [ ] Tests cover behavior and edge cases
- [ ] No secrets in code; logging is structured and safe
- [ ] Async code does not block the event loop

## Non-negotiables

1. **Type hints** on all public functions, methods, and module-level APIs.
2. **Explicit failures** — raise typed/domain exceptions; do not return `None` for error cases when an exception or `Result` is clearer.
3. **Single responsibility** — one module/class owns one concern.
4. **Testability** — inject dependencies; avoid hidden globals and hard-coded I/O.
5. **Security** — validate input; parameterize DB access; never log secrets.

## Default stack preferences

| Concern | Prefer |
|---------|--------|
| HTTP API | FastAPI + Pydantic v2 |
| Validation | Pydantic models / `Annotated` |
| CLI | `typer` or `argparse` (match project) |
| HTTP client | `httpx` |
| Testing | `pytest` + `pytest-asyncio` when needed |
| Lint/format | `ruff` (+ `mypy` or `pyright` for types) |
| Packaging | `pyproject.toml` (hatch/uv/poetry — match repo) |

If the repo already standardized differently, **match the repo**.

## Architecture (layered)

```text
api/        → HTTP/CLI adapters (thin)
application/→ use-cases / orchestration
domain/     → pure business rules & entities
infra/      → DB, queues, file, external APIs
schemas/    → request/response DTOs
```

- Dependencies point **inward** (api → application → domain).
- Domain code must not import FastAPI, SQLAlchemy session details, or HTTP clients.

## Coding rules (summary)

- Prefer composition over deep inheritance.
- Use `Protocol` for duck-typed interfaces you own.
- Prefer `dataclasses` or Pydantic for structured data; avoid untyped dicts past the edge.
- Context managers for resources (`with`, `async with`).
- f-strings for formatting; never concatenate SQL with f-strings.
- `pathlib.Path` over `os.path` for new code.

## Workflow

1. Read surrounding modules for conventions (imports, error style, test layout).
2. Implement the smallest correct change.
3. Add/adjust tests for changed behavior.
4. Run project checks when available: `ruff`, typechecker, `pytest`.

## Progressive disclosure

Read only what the task needs:

- [architecture.md](architecture.md) — layering, modules, dependency rules
- [typing-and-apis.md](typing-and-apis.md) — typing, FastAPI patterns, schemas
- [testing-and-quality.md](testing-and-quality.md) — pytest, fixtures, quality gates
- [security.md](security.md) — auth, secrets, injection, safe logging
- [examples.md](examples.md) — concrete good/bad patterns
