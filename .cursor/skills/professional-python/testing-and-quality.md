# Testing and Quality

## Philosophy

- Tests document behavior and prevent regressions.
- Prefer many fast unit tests for domain/use-cases; fewer integration tests for wiring.
- Test observable behavior, not private implementation details.

## Layout

```text
tests/
  conftest.py
  unit/
    domain/
    application/
  integration/
    api/
    db/
```

## Naming

```text
test_<unit>_<behavior>_<condition>
```

Examples:

- `test_create_user_raises_when_email_exists`
- `test_get_user_returns_404_for_unknown_id`

## Unit test example

```python
import pytest

from myapp.application.users.create_user import CreateUser, CreateUserInput
from myapp.domain.errors import EmailAlreadyExists


@pytest.mark.asyncio
async def test_create_user_raises_when_email_exists(user_repo):
    user_repo.exists_by_email.return_value = True
    use_case = CreateUser(users=user_repo)

    with pytest.raises(EmailAlreadyExists):
        await use_case.execute(CreateUserInput(email="a@b.com", name="Ada"))
```

## Fixtures

- Put shared fixtures in `conftest.py`.
- Prefer fake/in-memory repositories over mocking every method when practical.
- Use `respx` / `httpx.MockTransport` for HTTP; avoid real network in unit tests.

## Integration tests

- Boot the app with a test DB or containers when the project already does.
- Assert status codes, response schema, and side effects (row created).
- Clean up DB state between tests (transactions/rollback or truncated tables).

## Quality gates

Run what the project provides; typical baseline:

```bash
ruff check .
ruff format --check .
mypy src   # or pyright
pytest -q
```

## Coverage expectations

- New business logic: unit tests required.
- Bug fixes: add a regression test that fails without the fix.
- Pure refactors: keep existing tests green; do not delete coverage silently.

## Anti-patterns

- Asserting call counts only, with no behavioral assertion
- Sleeping in tests for timing
- Depending on test order
- Catching exceptions in tests without `pytest.raises`
