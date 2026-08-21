from __future__ import annotations

import firebase_admin
from firebase_admin import credentials, firestore
from google.api_core import exceptions as google_exceptions
from google.cloud.firestore import Client

from app.config import Settings, get_settings

_db: Client | None = None


class FirestoreNotReadyError(RuntimeError):
    """Raised when credentials work but the Firestore database was never created."""


def _firestore_missing_message(project_id: str) -> str:
    return (
        f"Firestore database (default) does not exist for project '{project_id}'. "
        "In Firebase Console > Build > Firestore Database > Create database "
        "(Native mode). Or open: "
        f"https://console.firebase.google.com/project/{project_id}/firestore"
    )


def init_firebase(settings: Settings | None = None) -> Client | None:
    global _db
    settings = settings or get_settings()
    if not settings.firebase_configured:
        return None
    if _db is not None:
        return _db

    if not firebase_admin._apps:
        private_key = settings.firebase_private_key.replace("\\n", "\n").strip().strip('"')
        client_email = settings.firebase_client_email.strip().strip('"')
        cred = credentials.Certificate(
            {
                "type": "service_account",
                "project_id": settings.firebase_project_id.strip(),
                "private_key_id": "from-env",
                "private_key": private_key,
                "client_email": client_email,
                "client_id": "",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": "",
            }
        )
        firebase_admin.initialize_app(cred)

    _db = firestore.client()
    return _db


def get_db() -> Client:
    db = init_firebase()
    if db is None:
        raise RuntimeError(
            "Firebase is not configured. Set FIREBASE_PROJECT_ID, "
            "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
        )
    return db


def is_firebase_configured() -> bool:
    return get_settings().firebase_configured


def map_firestore_error(exc: BaseException, project_id: str | None = None) -> BaseException:
    """Turn opaque Google 404s into an actionable error for the admin UI."""
    pid = project_id or get_settings().firebase_project_id
    text = str(exc)
    if isinstance(exc, google_exceptions.NotFound) and (
        "database" in text.lower() and "does not exist" in text.lower()
    ):
        return FirestoreNotReadyError(_firestore_missing_message(pid))
    return exc
