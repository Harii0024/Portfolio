# Python Security

## Secrets

- Never hardcode API keys, passwords, tokens, or private URLs with credentials.
- Load from environment / secret manager via settings objects.
- Keep `.env` out of git; commit `.env.example` with placeholders only.

## Input validation

- Validate all external input (HTTP body, query, headers you trust, CLI args, job payloads).
- Reject unexpected fields when security-sensitive (`model_config = ConfigDict(extra="forbid")` when appropriate).
- Enforce length/range limits on strings and collections.

## Injection

```python
# ❌ SQL injection risk
session.execute(f"SELECT * FROM users WHERE email = '{email}'")

# ✅ parameterized / ORM
session.execute(select(User).where(User.email == email))
```

- Same rule for shell: prefer argument lists to `subprocess`, never `shell=True` with user input.
- Path traversal: resolve paths and ensure they stay under an allowed root.

## AuthN / AuthZ

- Authenticate at the edge; authorize in use-case or dedicated policy layer.
- Check permissions on every sensitive operation (not only in the UI).
- Use short-lived tokens; rotate secrets; hash passwords with `bcrypt`/`argon2` (never MD5/SHA1).

## SSRF / outbound HTTP

- Do not let users supply arbitrary URLs to the server without allowlisting.
- Set timeouts on all HTTP clients.
- Limit redirect following for untrusted destinations.

## Logging & PII

```python
# ❌
logger.info("login %s password=%s", email, password)

# ✅
logger.info("login_attempt", extra={"email": email, "success": False})
```

- Redact tokens, passwords, session IDs, full card numbers, government IDs.
- Prefer structured logs for production services.

## Dependencies

- Pin dependencies in lockfiles (`uv.lock`, `poetry.lock`, etc.).
- Review advisories before adding new packages; prefer well-maintained libraries.
- Avoid `pickle` on untrusted data.

## Deserialization

- Prefer JSON with schema validation over pickle/yaml unsafe loaders.
- For YAML, use `safe_load` only.
