from __future__ import annotations

from typing import Any

from app.infra.firebase import get_db, is_firebase_configured, map_firestore_error

PRIMARY_ADMIN_ID = "primary"


def _firestore_call(fn):
    try:
        return fn()
    except Exception as exc:  # noqa: BLE001 — map then re-raise
        mapped = map_firestore_error(exc)
        if mapped is not exc:
            raise mapped from exc
        raise


def get_primary_admin() -> dict[str, Any] | None:
    if not is_firebase_configured():
        return _MEMORY.get(PRIMARY_ADMIN_ID)

    def _read() -> dict[str, Any] | None:
        snap = get_db().document(f"admins/{PRIMARY_ADMIN_ID}").get()
        if not snap.exists:
            return None
        data = snap.to_dict() or {}
        data["id"] = PRIMARY_ADMIN_ID
        return data

    return _firestore_call(_read)


def get_admin_by_email(email: str) -> dict[str, Any] | None:
    email_n = email.strip().lower()
    primary = get_primary_admin()
    if primary and str(primary.get("email") or "").lower() == email_n:
        return primary

    if not is_firebase_configured():
        for row in _MEMORY.values():
            if str(row.get("email") or "").lower() == email_n:
                return row
        return None

    def _query() -> dict[str, Any] | None:
        docs = (
            get_db()
            .collection("admins")
            .where("email", "==", email_n)
            .limit(1)
            .stream()
        )
        for doc in docs:
            data = doc.to_dict() or {}
            data["id"] = doc.id
            return data
        return None

    return _firestore_call(_query)


def save_primary_admin(
    *,
    email: str,
    descriptor: list[float],
) -> dict[str, Any]:
    email_n = email.strip().lower()
    payload = {
        "id": PRIMARY_ADMIN_ID,
        "email": email_n,
        "role": "admin",
        "faceDescriptor": descriptor,
    }
    if not is_firebase_configured():
        _MEMORY[PRIMARY_ADMIN_ID] = payload
        return payload

    def _write() -> dict[str, Any]:
        get_db().document(f"admins/{PRIMARY_ADMIN_ID}").set(payload, merge=True)
        return payload

    return _firestore_call(_write)


def list_admins_with_faces() -> list[dict[str, Any]]:
    primary = get_primary_admin()
    if primary and primary.get("faceDescriptor"):
        return [primary]

    if not is_firebase_configured():
        return [v for v in _MEMORY.values() if v.get("faceDescriptor")]

    def _list() -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for doc in get_db().collection("admins").stream():
            data = doc.to_dict() or {}
            if data.get("faceDescriptor"):
                data["id"] = doc.id
                out.append(data)
        return out

    return _firestore_call(_list)


_MEMORY: dict[str, dict[str, Any]] = {}
