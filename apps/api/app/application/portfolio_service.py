from __future__ import annotations

from typing import Any

from app.domain.experience import compute_experience_summary
from app.infra.firebase import get_db, is_firebase_configured
from app.seed.builder import build_seed_payload
from app.seed.content import (
    SEED_EDUCATION,
    SEED_EXPERIENCES,
    SEED_PROFILE,
    SEED_PROJECTS,
    SEED_SITE_SETTINGS,
    SEED_SKILL_GROUPS,
)

_SITE_ALLOWED_KEYS = frozenset(
    {
        "sectionLabels",
        "themePreset",
        "accentColor",
        "backgroundColor",
        "heroBackdrop",
    }
)


def _sort_by_order(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(items, key=lambda x: x.get("order", 0))


def _collection_docs(name: str) -> list[dict[str, Any]]:
    db = get_db()
    out: list[dict[str, Any]] = []
    for doc in db.collection(name).stream():
        data = doc.to_dict() or {}
        data["id"] = doc.id
        out.append(data)
    return out


def _normalize_site(raw: dict[str, Any] | None) -> dict[str, Any]:
    merged = {**SEED_SITE_SETTINGS, **(raw or {})}
    out = {k: merged[k] for k in _SITE_ALLOWED_KEYS if k in merged}
    # Ensure required visual keys always present after merge
    for key in _SITE_ALLOWED_KEYS:
        if key not in out and key in SEED_SITE_SETTINGS:
            out[key] = SEED_SITE_SETTINGS[key]
    if out.get("heroBackdrop") not in {"aurora", "mesh", "orchestrator"}:
        out["heroBackdrop"] = SEED_SITE_SETTINGS["heroBackdrop"]
    return out


def get_portfolio() -> dict[str, Any]:
    if not is_firebase_configured():
        return build_seed_payload()

    try:
        db = get_db()
        profile_ref = db.document("portfolio/profile").get()
        if not profile_ref.exists:
            return build_seed_payload()

        experiences = _sort_by_order(_collection_docs("experiences"))
        education = _sort_by_order(_collection_docs("education"))
        skill_groups = _sort_by_order(_collection_docs("skillGroups"))
        projects = _sort_by_order(_collection_docs("projects"))
        site_snap = db.document("siteSettings/main").get()
        site = _normalize_site(site_snap.to_dict())

        return {
            "profile": profile_ref.to_dict(),
            "experiences": experiences,
            "education": education,
            "skillGroups": skill_groups,
            "projects": projects,
            "site": site,
            "experienceSummary": compute_experience_summary(experiences),
            "source": "firestore",
        }
    except Exception:
        return build_seed_payload()


def seed_database(force: bool = False) -> dict[str, Any]:
    if not is_firebase_configured():
        raise RuntimeError("Firebase is not configured.")

    db = get_db()
    profile = db.document("portfolio/profile").get()
    if profile.exists and not force:
        return {
            "seeded": False,
            "message": "Data already exists. Pass force=true to overwrite.",
        }

    batch = db.batch()
    batch.set(db.document("portfolio/profile"), SEED_PROFILE)
    batch.set(db.document("siteSettings/main"), SEED_SITE_SETTINGS)

    for i, exp in enumerate(SEED_EXPERIENCES):
        batch.set(db.collection("experiences").document(f"exp-{i}"), exp)
    for i, edu in enumerate(SEED_EDUCATION):
        batch.set(db.collection("education").document(f"edu-{i}"), edu)
    for i, sg in enumerate(SEED_SKILL_GROUPS):
        batch.set(db.collection("skillGroups").document(f"skill-{i}"), sg)
    for i, proj in enumerate(SEED_PROJECTS):
        batch.set(db.collection("projects").document(f"proj-{i}"), proj)

    batch.commit()
    return {"seeded": True, "message": "Seeded resume content and site settings."}


def save_profile(profile: dict[str, Any]) -> None:
    get_db().document("portfolio/profile").set(profile, merge=True)


def save_site(settings: dict[str, Any]) -> None:
    clean = {k: v for k, v in settings.items() if k in _SITE_ALLOWED_KEYS}
    get_db().document("siteSettings/main").set(clean, merge=True)


def replace_collection(name: str, items: list[dict[str, Any]]) -> None:
    db = get_db()
    batch = db.batch()
    for doc in db.collection(name).stream():
        batch.delete(doc.reference)
    for index, item in enumerate(items):
        doc_id = item.get("id") or f"{name}-{index}"
        payload = {k: v for k, v in item.items() if k != "id"}
        if "order" not in payload:
            payload["order"] = index
        batch.set(db.collection(name).document(doc_id), payload)
    batch.commit()
