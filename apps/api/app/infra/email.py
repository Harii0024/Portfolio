from __future__ import annotations

import smtplib
from email.message import EmailMessage

from app.config import Settings, get_settings


def render_magic_link_email(
    *,
    link: str,
    email: str,
    settings: Settings | None = None,
) -> tuple[str, str]:
    settings = settings or get_settings()
    minutes = max(1, settings.magic_link_ttl_seconds // 60)
    subject = settings.magic_link_email_subject
    body = (
        settings.magic_link_email_body.replace("{{link}}", link)
        .replace("{{email}}", email)
        .replace("{{minutes}}", str(minutes))
    )
    return subject, body


def send_email(to: str, subject: str, body: str, settings: Settings | None = None) -> dict:
    settings = settings or get_settings()
    if not settings.smtp_configured:
        # Dev fallback — never fail local flows without SMTP
        print(f"[magic-link email fallback] to={to}\nsubject={subject}\n{body}")
        return {"sent": False, "fallback": "logged"}

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()
        if settings.smtp_user:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(msg)

    return {"sent": True, "fallback": None}
