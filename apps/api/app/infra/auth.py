from __future__ import annotations

from datetime import datetime, timezone

from jose import JWTError, jwt

from app.config import Settings, get_settings


def create_session_token(email: str, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "email": email,
        "role": "admin",
        "iat": int(now.timestamp()),
        "exp": int(now.timestamp()) + settings.session_max_age_seconds,
    }
    return jwt.encode(payload, settings.session_secret, algorithm="HS256")


def verify_session_token(token: str, settings: Settings | None = None) -> dict | None:
    settings = settings or get_settings()
    try:
        payload = jwt.decode(token, settings.session_secret, algorithms=["HS256"])
    except JWTError:
        return None
    if payload.get("role") != "admin" or not isinstance(payload.get("email"), str):
        return None
    return {"email": payload["email"], "role": "admin"}
