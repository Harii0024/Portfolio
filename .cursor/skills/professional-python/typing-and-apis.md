# Typing and APIs

## Typing standards

- Annotate all public callables. Prefer precise return types over `Any`.
- Use modern builtins: `list[str]`, `dict[str, int]`, `X | None`.
- Prefer `TypedDict` / Pydantic for structured payloads; avoid `dict[str, Any]` past boundaries.
- Use `TypeAlias` / `type` statements for repeated complex types.
- Prefer `Protocol` over ABC when structural typing is enough.
- For generics, parameterize containers and repository interfaces.

```python
# ❌
def get_user(id):  # type: ignore
    ...

# ✅
def get_user(user_id: str) -> User | None:
    ...
```

## Pydantic (v2) at the edge

```python
from pydantic import BaseModel, EmailStr, Field


class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=120)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str

    model_config = {"from_attributes": True}
```

- Request models validate inbound data.
- Response models control outbound shape (do not leak internal fields).
- Domain entities stay separate from transport DTOs when they diverge.

## FastAPI route shape

```python
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: CreateUserRequest,
    use_case: CreateUser = Depends(get_create_user),
) -> UserResponse:
    try:
        user = await use_case.execute(
            CreateUserInput(email=body.email, name=body.name)
        )
    except EmailAlreadyExists as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        ) from e
    return UserResponse.model_validate(user)
```

Rules:

- Routes: validate, authorize, invoke use-case, map errors → HTTP.
- No business rules inside route handlers.
- Prefer dependency injection via `Depends` for use-cases and auth.

## Error model

```python
class DomainError(Exception):
    """Base for expected business failures."""


class NotFoundError(DomainError):
    pass


class ConflictError(DomainError):
    pass
```

Map once in API middleware or per-route. Do not catch bare `Exception` to return 200/empty.

## Async rules

- `async def` for I/O-bound handlers using async clients.
- Never call blocking drivers (`requests`, sync SQLAlchemy) directly inside `async def`.
- Share `httpx.AsyncClient` via lifespan/dependencies; do not create a client per request without reason.
- Use `asyncio.gather` for independent concurrent I/O; bound concurrency when fan-out is large.

## Config

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    api_key: str
    debug: bool = False
```

- Load settings once; inject where needed.
- Provide `.env.example` with dummy values only.
