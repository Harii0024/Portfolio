# Python Examples

## Good vs bad: function design

```python
# ❌ BAD — mixed concerns, untyped, hidden I/O
def process(u):
    import requests
    r = requests.get(f"https://api.example.com/users/{u}")
    data = r.json()
    open("out.txt", "w").write(str(data))
    return data

# ✅ GOOD — typed, injected dependency, clear return
async def fetch_user(user_id: str, client: UserApiClient) -> UserDTO:
    return await client.get_user(user_id)
```

## Good vs bad: error handling

```python
# ❌ BAD
try:
    return repo.get(user_id)
except Exception:
    return None

# ✅ GOOD
try:
    return await repo.get(user_id)
except UserNotFoundError:
    raise
except RepositoryError as e:
    logger.exception("repository_failure", extra={"user_id": user_id})
    raise
```

## Good vs bad: data models

```python
# ❌ BAD
user = {"id": 1, "email": "a@b.com", "role": "admin"}

# ✅ GOOD
@dataclass(frozen=True, slots=True)
class User:
    id: str
    email: str
    role: Literal["admin", "member"]
```

## Minimal FastAPI module

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

app = FastAPI(title="Users")


class CreateUser(BaseModel):
    email: EmailStr
    name: str


@app.post("/users")
async def create_user(body: CreateUser) -> CreateUser:
    # wire to use-case in real apps
    return body
```

## pytest pattern

```python
def test_user_email_normalized():
    user = User.create(email=" Ada@Example.COM ", name="Ada")
    assert user.email == "ada@example.com"
```
