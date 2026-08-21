from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.application import auth_service
from app.application import portfolio_service as svc
from app.config import Settings, get_settings
from app.infra.auth import verify_session_token
from app.infra.firebase import is_firebase_configured
from app.infra.kv import magic_link_store
from app.schemas.portfolio import (
    FaceDescriptorRequest,
    FaceEnrollRequest,
    MagicLinkRequest,
    MagicLinkVerifyRequest,
    SeedRequest,
)

router = APIRouter(prefix="/api")


def require_admin(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> dict:
    token = request.cookies.get(settings.session_cookie_name)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    session = verify_session_token(token, settings)
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return session


@router.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "firebase": is_firebase_configured(),
        "magicLinkStore": magic_link_store(),
        "auth": ["face", "magic_link"],
    }


@router.get("/portfolio")
def portfolio() -> dict:
    return svc.get_portfolio()


@router.get("/auth/face/status")
def face_status() -> dict:
    return auth_service.face_status()


@router.post("/auth/face/register")
def face_register(body: FaceEnrollRequest, response: Response) -> dict:
    try:
        return auth_service.register_face_with_setup_key(
            body.setup_key,
            body.email,
            body.descriptor,
            response,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/auth/face/login")
def face_login(body: FaceDescriptorRequest, response: Response) -> dict:
    try:
        return auth_service.login_with_face(body.descriptor, response)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/auth/magic-link/request")
def magic_link_request(
    body: MagicLinkRequest,
    request: Request,
    response: Response,
    settings: Settings = Depends(get_settings),
) -> dict:
    binding = request.cookies.get(settings.magic_link_bind_cookie)
    return auth_service.request_magic_link(
        response,
        binding,
        email=body.email,
        settings=settings,
    )


@router.post("/auth/magic-link/verify")
def magic_link_verify(
    body: MagicLinkVerifyRequest,
    request: Request,
    response: Response,
    settings: Settings = Depends(get_settings),
) -> dict:
    binding = request.cookies.get(settings.magic_link_bind_cookie)
    return auth_service.verify_magic_link(body.token, binding, response, settings)


@router.post("/auth/logout")
def logout(response: Response, settings: Settings = Depends(get_settings)) -> dict:
    response.delete_cookie(settings.session_cookie_name, path="/")
    response.delete_cookie(settings.magic_link_bind_cookie, path="/")
    return {"ok": True}


@router.get("/auth/me")
def me(session: dict = Depends(require_admin)) -> dict:
    return {"authenticated": True, "email": session["email"]}


@router.post("/admin/seed")
def seed(body: SeedRequest, _: dict = Depends(require_admin)) -> dict:
    try:
        return svc.seed_database(force=body.force)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/admin/profile")
def get_profile(_: dict = Depends(require_admin)) -> dict:
    return svc.get_portfolio()["profile"]


@router.put("/admin/profile")
def put_profile(body: dict, _: dict = Depends(require_admin)) -> dict:
    if not is_firebase_configured():
        raise HTTPException(status_code=503, detail="Firebase is not configured.")
    svc.save_profile(body)
    return {"ok": True}


@router.get("/admin/site")
def get_site(_: dict = Depends(require_admin)) -> dict:
    return svc.get_portfolio()["site"]


@router.put("/admin/site")
def put_site(body: dict, _: dict = Depends(require_admin)) -> dict:
    if not is_firebase_configured():
        raise HTTPException(status_code=503, detail="Firebase is not configured.")
    svc.save_site(body)
    return {"ok": True}


def _put_collection(name: str, items: list) -> dict:
    if not is_firebase_configured():
        raise HTTPException(status_code=503, detail="Firebase is not configured.")
    svc.replace_collection(name, items)
    return {"ok": True}


@router.get("/admin/experiences")
def get_experiences(_: dict = Depends(require_admin)) -> list:
    return svc.get_portfolio()["experiences"]


@router.put("/admin/experiences")
def put_experiences(body: list[dict], _: dict = Depends(require_admin)) -> dict:
    return _put_collection("experiences", body)


@router.get("/admin/education")
def get_education(_: dict = Depends(require_admin)) -> list:
    return svc.get_portfolio()["education"]


@router.put("/admin/education")
def put_education(body: list[dict], _: dict = Depends(require_admin)) -> dict:
    return _put_collection("education", body)


@router.get("/admin/skills")
def get_skills(_: dict = Depends(require_admin)) -> list:
    return svc.get_portfolio()["skillGroups"]


@router.put("/admin/skills")
def put_skills(body: list[dict], _: dict = Depends(require_admin)) -> dict:
    return _put_collection("skillGroups", body)


@router.get("/admin/projects")
def get_projects(_: dict = Depends(require_admin)) -> list:
    return svc.get_portfolio()["projects"]


@router.put("/admin/projects")
def put_projects(body: list[dict], _: dict = Depends(require_admin)) -> dict:
    return _put_collection("projects", body)
