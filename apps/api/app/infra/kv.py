from __future__ import annotations

import threading
import time
from datetime import datetime, timedelta, timezone
from typing import Any

from app.infra.firebase import get_db, is_firebase_configured

COLLECTION = "magicLinks"

_memory: dict[str, tuple[dict[str, Any], float]] = {}
_lock = threading.Lock()


def _token_from_key(key: str) -> str:
    return key.removeprefix("magic:") if key.startswith("magic:") else key


def set_json(key: str, value: dict[str, Any], ttl_seconds: int) -> None:
    """Store a short-lived magic-link payload in Firestore (or memory fallback)."""
    token = _token_from_key(key)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
    payload = {
        **value,
        "expiresAt": expires_at,
        "createdAt": datetime.now(timezone.utc),
    }

    if is_firebase_configured():
        get_db().collection(COLLECTION).document(token).set(payload)
        return

    with _lock:
        _memory[token] = (dict(value), time.time() + ttl_seconds)


def get_json(key: str) -> dict[str, Any] | None:
    token = _token_from_key(key)

    if is_firebase_configured():
        snap = get_db().collection(COLLECTION).document(token).get()
        if not snap.exists:
            return None
        data = snap.to_dict() or {}
        expires = data.get("expiresAt")
        if expires is not None:
            if getattr(expires, "tzinfo", None) is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > expires:
                snap.reference.delete()
                return None
        # Return auth fields only
        return {
            k: v
            for k, v in data.items()
            if k not in {"expiresAt", "createdAt"}
        }

    with _lock:
        item = _memory.get(token)
        if not item:
            return None
        value, expires_ts = item
        if time.time() > expires_ts:
            _memory.pop(token, None)
            return None
        return dict(value)


def delete(key: str) -> None:
    token = _token_from_key(key)
    if is_firebase_configured():
        get_db().collection(COLLECTION).document(token).delete()
        return
    with _lock:
        _memory.pop(token, None)


def magic_link_store() -> str:
    return "firestore" if is_firebase_configured() else "memory"
