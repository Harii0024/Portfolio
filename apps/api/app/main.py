from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.config import get_settings
from app.infra.firebase import FirestoreNotReadyError, init_firebase


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    if settings.firebase_configured:
        init_firebase(settings)
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        default_response_class=JSONResponse,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(HTTPException)
    async def http_exc(_: Request, exc: HTTPException):
        detail = exc.detail
        message = detail if isinstance(detail, str) else str(detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": message, "detail": message},
        )

    @app.exception_handler(FirestoreNotReadyError)
    async def firestore_not_ready(_: Request, exc: FirestoreNotReadyError):
        return JSONResponse(
            status_code=503,
            content={"error": str(exc), "detail": str(exc)},
        )

    @app.exception_handler(Exception)
    async def unhandled(_: Request, exc: Exception):
        message = str(exc) or exc.__class__.__name__
        return JSONResponse(
            status_code=500,
            content={"error": message, "detail": message},
        )

    app.include_router(router)
    return app


app = create_app()
