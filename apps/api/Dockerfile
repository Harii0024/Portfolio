# Cloud Run image for FastAPI only.
FROM python:3.12-slim-bookworm

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml ./
COPY app ./app

RUN uv sync --no-dev

ENV PATH="/app/.venv/bin:$PATH"
ENV PORT=8080
ENV ENVIRONMENT=production
ENV COOKIE_SECURE=true

EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
