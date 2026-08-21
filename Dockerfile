# Single-server production image (Next.js + FastAPI in one container).
# Public port: 3000. API runs on 127.0.0.1:8000 inside the container only.

FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

# Install uv for Python API
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install Node deps (cache layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY packages/web-config/package.json packages/web-config/package.json
RUN pnpm install --frozen-lockfile

# Install Python deps
COPY apps/api/pyproject.toml apps/api/pyproject.toml
COPY apps/api/app apps/api/app
RUN uv sync --directory apps/api --no-dev

# Copy source and build web
COPY apps/web apps/web
COPY packages/web-config packages/web-config
COPY scripts/start-prod.mjs scripts/start-prod.mjs

ENV BACKEND_URL=http://127.0.0.1:8000
RUN pnpm --filter @hari/web build

ENV NODE_ENV=production
ENV PORT=3000
ENV API_PORT=8000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s \
  CMD curl -fsS http://127.0.0.1:3000/ > /dev/null || exit 1

CMD ["node", "scripts/start-prod.mjs"]
