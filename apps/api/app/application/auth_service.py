from __future__ import annotations

import secrets
import uuid
from typing import Any

from fastapi import HTTPException, Response, status

from app.config import Settings, get_settings
from app.domain.face import is_face_match, validate_descriptor
from app.infra import admins as admin_store
from app.infra.auth import create_session_token
from app.infra.email import render_magic_link_email, send_email
from app.infra import kv


def _set_session_cookie(response: Response, subject: str, settings: Settings) -> None:
    token = create_session_token(subject, settings)
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.session_max_age_seconds,
        path="/",
    )


def register_face_with_setup_key(
    setup_key: str,
    email: str,
    descriptor: list[float],
    response: Response,
    settings: Settings | None = None,
) -> dict:
    """First-time enroll: verify ADMIN_SETUP_KEY, store email+descriptor in DB, set session."""
    settings = settings or get_settings()
    if not settings.admin_setup_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ADMIN_SETUP_KEY is not configured in .env",
        )
    if setup_key.strip() != settings.admin_setup_key.strip():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid setup key.",
        )

    email_n = email.strip().lower()
    if not email_n or "@" not in email_n:
        raise HTTPException(status_code=400, detail="A valid email is required to store the admin.")

    existing = admin_store.get_primary_admin()
    if existing and existing.get("faceDescriptor"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin face already enrolled. Use face login.",
        )

    desc = validate_descriptor(descriptor, settings.face_descriptor_size)
    admin_store.save_primary_admin(email=email_n, descriptor=desc)
    _set_session_cookie(response, email_n, settings)
    return {"ok": True, "enrolled": True, "email": email_n, "method": "face_enroll"}


def login_with_face(
    descriptor: list[float],
    response: Response,
    settings: Settings | None = None,
) -> dict:
    settings = settings or get_settings()
    live = validate_descriptor(descriptor, settings.face_descriptor_size)

    candidates = admin_store.list_admins_with_faces()
    best: tuple[float, dict[str, Any]] | None = None
    for admin in candidates:
        stored = admin.get("faceDescriptor")
        if not stored:
            continue
        try:
            matched, distance = is_face_match(live, stored, settings.face_match_threshold)
        except ValueError:
            continue
        if matched and (best is None or distance < best[0]):
            best = (distance, admin)

    if best is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Face not recognized. Complete first-time setup or use magic link.",
        )

    subject = str(best[1].get("email") or best[1].get("id") or "admin").lower()
    _set_session_cookie(response, subject, settings)
    return {"ok": True, "email": subject, "distance": best[0], "method": "face"}


def request_magic_link(
    response: Response,
    binding: str | None,
    email: str,
    settings: Settings | None = None,
) -> dict:
    """Magic link only if email exists on an admin record in the DB."""
    settings = settings or get_settings()
    email_n = email.strip().lower()
    if not email_n:
        raise HTTPException(status_code=400, detail="Email is required.")

    admin = admin_store.get_admin_by_email(email_n)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No admin found for this email. Complete face setup first.",
        )

    bind = binding or str(uuid.uuid4())
    response.set_cookie(
        key=settings.magic_link_bind_cookie,
        value=bind,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.magic_link_ttl_seconds,
        path="/",
    )

    token = secrets.token_urlsafe(32)
    kv.set_json(
        f"magic:{token}",
        {"email": email_n, "binding": bind, "used": False},
        settings.magic_link_ttl_seconds,
    )

    link = f"{settings.frontend_url.rstrip('/')}{settings.magic_link_path}?token={token}"
    subject, body = render_magic_link_email(link=link, email=email_n, settings=settings)
    mail = send_email(email_n, subject, body, settings)

    return {
        "ok": True,
        "email": email_n,
        "expiresIn": settings.magic_link_ttl_seconds,
        "emailDelivery": mail,
        "devLink": link if not mail.get("sent") else None,
    }


def verify_magic_link(
    token: str,
    binding: str | None,
    response: Response,
    settings: Settings | None = None,
) -> dict:
    settings = settings or get_settings()
    if not token:
        raise HTTPException(status_code=400, detail="Missing token.")

    key = f"magic:{token}"
    payload = kv.get_json(key)
    if not payload:
        raise HTTPException(status_code=401, detail="Link expired or invalid.")
    if payload.get("used"):
        raise HTTPException(status_code=401, detail="Link already used.")

    if not binding or binding != payload.get("binding"):
        raise HTTPException(
            status_code=401,
            detail="Open the link in the same browser where you requested it.",
        )

    email = str(payload.get("email") or "").lower()
    admin = admin_store.get_admin_by_email(email)
    if not admin:
        raise HTTPException(status_code=401, detail="Admin no longer exists.")

    kv.delete(key)
    _set_session_cookie(response, email, settings)
    response.delete_cookie(settings.magic_link_bind_cookie, path="/")
    return {"ok": True, "email": email, "method": "magic_link"}


def face_status(settings: Settings | None = None) -> dict:
    settings = settings or get_settings()
    primary = admin_store.get_primary_admin()
    enrolled = bool(primary and primary.get("faceDescriptor"))
    return {
        "faceEnrolled": enrolled,
        "setupRequired": not enrolled,
        "setupKeyConfigured": bool(settings.admin_setup_key),
        "threshold": settings.face_match_threshold,
    }
