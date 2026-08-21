from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Hari AI Works API"
    environment: str = "development"
    cors_origins: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"

    firebase_project_id: str = ""
    firebase_client_email: str = ""
    firebase_private_key: str = ""

    # Short bootstrap key — required on first admin open to enroll face into DB
    admin_setup_key: str = ""

    session_secret: str = "dev-only-change-me-please-32chars"
    session_cookie_name: str = "hari_admin_session"
    session_max_age_seconds: int = 60 * 60 * 24 * 7
    cookie_secure: bool = False

    # Face auth (face-api.js 128-d descriptor, Euclidean distance)
    face_match_threshold: float = 0.55
    face_descriptor_size: int = 128

    # Magic link (tokens stored in Firestore collection magicLinks)
    magic_link_ttl_seconds: int = 900
    magic_link_bind_cookie: str = "hari_ml_bind"
    magic_link_path: str = "/admin/verify"

    # Email (SMTP). If unset, magic-link URL is logged (dev fallback).
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_use_tls: bool = True

    # Optional override for magic-link email body (use {{link}} {{email}})
    magic_link_email_subject: str = "Your Hari AI Works sign-in link"
    magic_link_email_body: str = (
        "Hi,\n\nOpen this one-time link in the same browser to sign in:\n\n{{link}}\n\n"
        "It expires in {{minutes}} minutes and can only be used once.\n"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def firebase_configured(self) -> bool:
        return bool(
            self.firebase_project_id
            and self.firebase_client_email
            and self.firebase_private_key
        )

    @property
    def smtp_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_from)


@lru_cache
def get_settings() -> Settings:
    return Settings()
