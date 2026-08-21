# Python Architecture

## Goals

- Keep business rules framework-agnostic and unit-testable.
- Make side effects (DB, HTTP, disk) explicit and replaceable.
- Keep entrypoints thin: parse → authorize → call use-case → map response.

## Recommended layout

```text
src/myapp/
  __init__.py
  main.py                 # app factory / ASGI entry
  api/
    deps.py               # FastAPI dependencies
    routes/
      users.py
  application/
    users/
      create_user.py      # use-case
      ports.py            # Protocols (repositories, gateways)
  domain/
    user.py               # entities / value objects
    errors.py             # domain exceptions
  infra/
    db/
      models.py
      repositories.py
    http/
      payment_client.py
  schemas/
    user.py               # Pydantic request/response
tests/
  unit/
  integration/
  conftest.py
```

## Dependency rule

Allowed import direction:

```text
api → application → domain
infra → application ports / domain
schemas → used by api (and sometimes application)
```

Forbidden:

- `domain` importing `fastapi`, `sqlalchemy`, `httpx`
- `application` importing concrete `infra` classes (depend on `Protocol` instead)

## Use-case pattern

```python
from dataclasses import dataclass

from myapp.application.users.ports import UserRepository
from myapp.domain.errors import EmailAlreadyExists
from myapp.domain.user import User


@dataclass(frozen=True, slots=True)
class CreateUserInput:
    email: str
    name: str


@dataclass(frozen=True, slots=True)
class CreateUser:
    users: UserRepository

    async def execute(self, data: CreateUserInput) -> User:
        if await self.users.exists_by_email(data.email):
            raise EmailAlreadyExists(data.email)
        user = User.create(email=data.email, name=data.name)
        return await self.users.save(user)
```

## Ports (Protocols)

```python
from typing import Protocol
from myapp.domain.user import User


class UserRepository(Protocol):
    async def exists_by_email(self, email: str) -> bool: ...
    async def save(self, user: User) -> User: ...
```

## When to simplify

For small scripts or one-file tools, do **not** force full hexagonal layout. Use:

- clear functions
- typed inputs/outputs
- a `main()` entrypoint
- tests for non-trivial logic

Scale structure with complexity, not vanity.
