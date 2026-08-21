Legal Document Processing Platform (LDPP)
Monorepo for the Legal Document Processing Platform — a production system that ingests, classifies, and extracts structured data from legal documents using AI. The codebase spans a Next.js admin UI, a FastAPI backend, an async worker process, and a suite of shared Python packages, all orchestrated inside a single repository.
---
Table of Contents
Architecture Overview
What Is pnpm and Why Do We Use It?
How pnpm Is Configured in This Project
Prerequisites
Installation
Building the Project
Running Locally
Testing
Docker & Production Builds
CI / CD
Common pnpm Commands Reference
Troubleshooting
License
---
Architecture Overview
```
legal-document-processing-platform/          ← monorepo root
│
├── apps/
│   ├── admin-web/        → Next.js 16 admin dashboard  (TypeScript)
│   ├── api/              → FastAPI REST API             (Python)
│   └── worker/           → Async document-processing    (Python)
│
├── packages/
│   ├── web-config/       → Shared Next.js server helpers      (TypeScript, pnpm workspace)
│   ├── file-storage/     → GCS / S3 file-storage abstraction  (TypeScript + Python)
│   ├── domain/           → Domain models & business rules     (Python, uv workspace)
│   ├── application/      → Application services / use-cases   (Python, uv workspace)
│   ├── infrastructure/   → DB, Redis, AI adapters             (Python, uv workspace)
│   ├── ai-services/      → Vertex AI / Gemini integration     (Python, uv workspace)
│   ├── eventing/         → Event bus abstractions             (Python, uv workspace)
│   ├── config/           → Shared configuration               (Python, uv workspace)
│   ├── shared/           → Cross-cutting utilities            (Python, uv workspace)
│   └── observability/    → OpenTelemetry instrumentation      (Python, uv workspace)
│
├── package.json          → Root pnpm manifest (scripts, engines, devDependencies)
├── pnpm-workspace.yaml   → Declares which folders are pnpm workspace packages
├── pnpm-lock.yaml        → Deterministic lockfile for all Node.js dependencies
├── .npmrc                → pnpm behaviour settings
├── pyproject.toml        → Root Python manifest (uv workspace members)
└── uv.lock               → Deterministic lockfile for all Python dependencies
```
This is a polyglot monorepo. It uses two workspace managers side by side:
Concern	Tool	Config File
TypeScript / Node.js packages	pnpm	`pnpm-workspace.yaml`
Python packages	uv	`pyproject.toml` → `[tool.uv.workspace]`
The rest of this README focuses on the pnpm side.
---
What Is pnpm and Why Do We Use It?
What Is pnpm?
pnpm (Performant npm) is a fast, disk-space-efficient package manager for Node.js. It is a drop-in replacement for `npm` and `yarn` but works fundamentally differently under the hood.
How pnpm stores packages:
```
Traditional (npm / yarn)                 pnpm
─────────────────────────                ────
project-a/node_modules/react/  ←copy    global store (~/.pnpm-store)
project-b/node_modules/react/  ←copy        └── react@19.2.5/
project-c/node_modules/react/  ←copy            (single copy on disk)
                                         project-a/node_modules/react → hard link
3 full copies on disk                    project-b/node_modules/react → hard link
                                         project-c/node_modules/react → hard link
                                         0 extra copies — all point to the same bytes
```
Instead of copying every package into each project's `node_modules`, pnpm keeps one copy in a global content-addressable store (`~/.pnpm-store`) and creates hard links into each project. This means:
Blazing fast installs — packages already in the store are linked, not downloaded again.
Massive disk savings — 10 projects using React don't need 10 copies; they share one.
Strict `node_modules` — by default, a package can only `require()` its declared dependencies. This catches "phantom dependency" bugs that `npm` silently allows.
Why pnpm for This Project?
Reason	Explanation
Monorepo workspaces	pnpm has first-class support for workspaces. `admin-web` can depend on `web-config` via `"@ldpp/web-config": "workspace:*"` and pnpm symlinks them automatically — no publishing to a registry needed.
Speed	On CI, `pnpm install --frozen-lockfile` with a warm cache typically runs 2–3× faster than `npm ci`. This saves real minutes on every pull request.
Disk efficiency	Our repo has 260 KB+ of lock entries. With npm, every developer machine and CI runner would store duplicate copies. pnpm's content-addressable store avoids this entirely.
Correctness	pnpm's strict `node_modules` structure ensures we never accidentally import a package we didn't declare. If it's not in `package.json`, it won't resolve — catching bugs before production.
Docker layer caching	The Dockerfile copies `pnpm-lock.yaml` early and runs `pnpm install --frozen-lockfile`, creating a cacheable layer. Subsequent builds only re-install if dependencies actually changed.
Corepack integration	We pin `"packageManager": "pnpm@8.15.0"` in `package.json`. Node's built-in Corepack will auto-download and use exactly that version, guaranteeing every developer and CI runner uses the same pnpm.
pnpm vs npm vs yarn — Quick Comparison
Feature	npm	yarn (classic)	pnpm
Install speed	Slowest	Medium	Fastest
Disk usage	High (copies)	High (copies)	Low (hard links)
Workspace support	v7+	v1+	v1+ (first-class)
Strict dependencies	No	No	Yes (by default)
Lockfile determinism	`package-lock.json`	`yarn.lock`	`pnpm-lock.yaml`
Phantom dependency bugs	Possible	Possible	Prevented
---
How pnpm Is Configured in This Project
1. `pnpm-workspace.yaml` — Workspace Definition
```yaml
packages:
  - 'apps/*'
  - 'packages/web-config'
```
This tells pnpm: "Treat every folder under `apps/` and the `packages/web-config` folder as workspace packages." In practice, this means:
Workspace Package	Location	Description
`@ldpp/admin-web`	`apps/admin-web`	Next.js admin dashboard
`@ldpp/web-config`	`packages/web-config`	Shared server-side Next.js helpers
> **Note:** Python packages (`apps/api`, `apps/worker`, `packages/domain`, etc.) are **not** pnpm workspaces — they are managed by **uv** via `pyproject.toml`. pnpm only manages the TypeScript/Node.js side.
2. `package.json` — Root Manifest
The root `package.json` serves as the orchestration hub:
```jsonc
{
  "packageManager": "pnpm@8.15.0",     // Corepack auto-uses this exact version
  "engines": {
    "node": ">=20.9.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev:admin": "pnpm --filter @ldpp/admin-web dev",
    "build":     "pnpm -r build",       // Recursively builds all workspaces
    "lint":      "pnpm -r lint",        // Recursively lints all workspaces
    "test:unit": "pnpm --filter @ldpp/admin-web test:unit",
    // ... more scripts
  }
}
```
Key patterns:
`pnpm -r <script>` — Runs a script in every workspace package that defines it (recursive).
`pnpm --filter <name> <script>` — Runs a script in one specific workspace package.
`pnpm --filter <name>...` — Targets a package and all its dependencies (used in Docker installs).
3. `.npmrc` — Behaviour Settings
```ini
shamefully-hoist=true        # Hoist all deps to root node_modules (needed for Next.js compatibility)
strict-peer-dependencies=false   # Don't fail on peer-dep mismatches
auto-install-peers=true      # Automatically install missing peer dependencies
```
> `shamefully-hoist=true` relaxes pnpm's strict node_modules structure. This is required because Next.js and some plugins expect packages to be hoisted to the root — a common trade-off in Next.js monorepos.
4. `pnpm-lock.yaml` — The Lockfile
This is the deterministic lockfile that guarantees every developer and CI environment installs the exact same dependency tree, down to the patch version. Never edit this file by hand — it is auto-generated by `pnpm install`.
5. Workspace Protocol — `workspace:*`
In `apps/admin-web/package.json`:
```json
{
  "dependencies": {
    "@ldpp/web-config": "workspace:*"
  }
}
```
The `workspace:*` protocol tells pnpm: "Don't download this from the npm registry — link it from the local `packages/web-config` folder instead." This enables seamless cross-package development without publishing.
---
Prerequisites
Tool	Version	Purpose
Node.js	≥ 20.9.0	JavaScript runtime
pnpm	≥ 8.0.0 (auto-managed via Corepack)	Node.js package manager
Python	≥ 3.11	Backend runtime
uv	Latest	Python package manager (install)
PostgreSQL	15+	Primary database
Redis	7+	Event bus / caching
Docker	24+	Container builds (optional for local dev)
Installing pnpm
Option A — Corepack (recommended):
Corepack ships with Node.js 16.13+ and automatically provisions the correct pnpm version based on the `"packageManager"` field in `package.json`.
```bash
# Enable Corepack (one-time setup)
corepack enable

# Now `pnpm` commands will auto-download pnpm@8.15.0
pnpm --version
# → 8.15.0
```
Option B — Standalone install:
```bash
# npm
npm install -g pnpm@8.15.0

# Homebrew (macOS)
brew install pnpm

# Windows (Scoop)
scoop install pnpm

# Windows (Chocolatey)
choco install pnpm

# curl (Linux/macOS)
curl -fsSL https://get.pnpm.io/install.sh | sh -
```
---
Installation
```bash
# 1. Clone the repository
git clone https://github.com/thapovan-inc/legal-document-processing-platform.git
cd legal-document-processing-platform

# 2. Install all Node.js dependencies (TypeScript packages)
pnpm install

# 3. Install all Python dependencies (backend packages)
uv sync --all-packages --all-extras

# 4. Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env → set DATABASE_URL, Redis, JWT secret, GCP credentials, etc.
```
What `pnpm install` does:
Reads `pnpm-lock.yaml` to determine exact versions.
Downloads any missing packages to the global store (`~/.pnpm-store`).
Hard-links packages into each workspace's `node_modules`.
Symlinks workspace packages (e.g., `@ldpp/web-config` → `packages/web-config`).
Runs any `postinstall` scripts.
---
Building the Project
Build All Node.js Packages
```bash
pnpm build
# Equivalent to: pnpm -r build
# Runs `next build` in admin-web and any other workspace `build` scripts
```
Build a Specific Package
```bash
# Build only the admin-web dashboard
pnpm --filter @ldpp/admin-web build
```
Type-Check All Packages
```bash
pnpm type-check
# Equivalent to: pnpm -r type-check
# Runs `tsc --noEmit` in every workspace that has a type-check script
```
Lint & Format
```bash
# Lint all workspaces
pnpm lint

# Check formatting (Prettier)
pnpm format

# Auto-fix formatting
pnpm format:fix
```
---
Running Locally
Start the Admin Web Dashboard
```bash
pnpm dev:admin
# → Starts Next.js dev server on http://localhost:3000
```
Start the API Server
```bash
pnpm dev:api
# → Runs Alembic migrations, then starts FastAPI on http://localhost:8000
```
Start the Background Worker
```bash
pnpm dev:worker
# → Runs migrations, then starts the async document-processing worker
```
Start Infrastructure (PostgreSQL, Redis, etc.)
```bash
# Using the Docker Compose stack
pnpm observability:up

# Tear it down
pnpm observability:down
```
Run Everything Together
Open three terminals:
```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Admin UI
pnpm dev:admin

# Terminal 3 — Worker (optional)
pnpm dev:worker
```
---
Testing
Run All Tests
```bash
pnpm test
# Runs unit → integration → functional tests sequentially
```
Run Specific Test Suites
```bash
# Unit tests only (Python + TypeScript)
pnpm test:unit

# Integration tests (Python — requires running DB & Redis)
pnpm test:integration

# Functional tests (Python API + TypeScript admin-web)
pnpm test:functional

# End-to-end browser tests (Playwright)
pnpm test:e2e

# Visual regression tests
pnpm test:e2e:visual

# Update visual snapshots
pnpm test:e2e:visual:update

# Coverage report
pnpm test:coverage
```
Run Tests for a Single Package
```bash
# Only admin-web unit tests
pnpm --filter @ldpp/admin-web test:unit

# Only API Python tests
pnpm --filter api exec uv run pytest
```
---
Docker & Production Builds
The admin-web app has a multi-stage Dockerfile that leverages pnpm for efficient container builds:
```bash
# Build from the repository root
docker build -f apps/admin-web/Dockerfile -t ldpp-admin-web .
```
How pnpm is used in Docker:
```dockerfile
# Stage 1 — Base: Enable Corepack so pnpm is available
FROM node:22-bookworm-slim AS base
RUN corepack enable

# Stage 2 — Dependencies: Copy only manifests + lockfile, install with frozen lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin-web/package.json apps/admin-web/package.json
COPY packages/web-config/package.json packages/web-config/package.json
RUN pnpm install --frozen-lockfile --filter @ldpp/admin-web...

# Stage 3 — Build: Copy source and build
COPY apps/admin-web apps/admin-web
COPY packages/web-config packages/web-config
RUN pnpm --filter @ldpp/admin-web build

# Stage 4 — Production deps only
RUN pnpm install --prod --frozen-lockfile --filter @ldpp/admin-web...
```
Key Docker optimization patterns:
`--frozen-lockfile` — Fails if `pnpm-lock.yaml` is out of sync (guarantees reproducibility).
`--filter @ldpp/admin-web...` — The trailing `...` means "this package AND all its workspace dependencies" (installs `web-config` too).
`--prod` — Installs only production dependencies (strips devDependencies).
Separate copy of manifests — Docker caches this layer; source changes don't trigger re-install.
---
CI / CD
GitHub Actions
CI workflows use `pnpm/action-setup@v4` to install pnpm with caching:
```yaml
# .github/workflows/test-unit.yml
steps:
  - uses: actions/checkout@v4
  - uses: pnpm/action-setup@v4          # Installs pnpm (reads packageManager from package.json)
  - uses: actions/setup-node@v4
    with:
      node-version: 22
      cache: "pnpm"                      # Caches ~/.pnpm-store between runs
  - run: pnpm install --frozen-lockfile  # Deterministic install
  - run: pnpm --filter @ldpp/admin-web test:unit
```
Production Deployments
Production CI builds Docker images and deploys to AWS ECS via a reusable workflow. The Docker build internally uses pnpm as described above.
---
Common pnpm Commands Reference
Command	What It Does
`pnpm install`	Install all dependencies for all workspaces
`pnpm install --frozen-lockfile`	Install without modifying the lockfile (CI-safe)
`pnpm add <pkg>`	Add a dependency to the root
`pnpm add <pkg> --filter @ldpp/admin-web`	Add a dependency to a specific workspace
`pnpm add -D <pkg>`	Add a dev dependency
`pnpm remove <pkg>`	Remove a dependency
`pnpm -r build`	Run `build` in every workspace that has it
`pnpm --filter <name> <script>`	Run a script in a specific workspace
`pnpm --filter <name>... install`	Install deps for a package + its workspace dependencies
`pnpm exec <cmd>`	Run a locally installed binary
`pnpm dlx <pkg>`	Run a one-off package (like `npx`)
`pnpm ls`	List installed packages
`pnpm ls -r`	List installed packages across all workspaces
`pnpm outdated`	Check for outdated dependencies
`pnpm update`	Update dependencies (respecting semver ranges)
`pnpm store prune`	Clean unused packages from the global store
`pnpm why <pkg>`	Show why a package is installed (dependency chain)
---
Troubleshooting
"ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE"
The lockfile is out of sync with `package.json`. Run:
```bash
pnpm install
# Then commit the updated pnpm-lock.yaml
```
"Cannot find module '@ldpp/web-config'"
Workspace links may be broken. Re-install:
```bash
pnpm install
```
"ERR_PNPM_PEER_DEP_ISSUES"
We have `strict-peer-dependencies=false` in `.npmrc`, so this shouldn't block installs. If it does, check whether a new dependency has conflicting peer requirements.
Wrong pnpm Version
If you see version mismatch errors:
```bash
corepack enable
corepack prepare pnpm@8.15.0 --activate
pnpm --version  # Should show 8.15.0
```
Clearing the Cache
```bash
# Remove all node_modules and reinstall
pnpm clean
pnpm install

# Or just nuke and rebuild
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```
---
License
Same as upstream unless you replace it.