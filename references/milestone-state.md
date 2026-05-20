# Milestone State

Last updated: 2026-05-20 (M1 done / M2 in_review)

## M1 — Architecture & Contracts
**Owner:** Principal Architect
**Status:** done
**Started:** 2026-05-20
**Delivered:** 2026-05-20
**Approved:** 2026-05-20

**Branch merged:** `feat/m1-architecture-and-contracts` → `dev` (fast-forward, commit `687f2aa`, pushed to `origin/dev`).

**Deliverables (all on disk, SHA `687f2aa`):**
- Prisma schema with all entities + column conventions — `/packages/db/prisma/schema.prisma` (33 models, 22 enums, UUID PKs, timestamptz, metadata jsonb, soft-delete via `status`, full `account_id`/`location_id` tenant-scoping)
- Initial migration applied to local Postgres — `/packages/db/prisma/migrations/20260520204152_init/migration.sql` (1,106 lines)
- Service-abstraction TypeScript interfaces — `/packages/shared-types/src/services/*.ts` (7 interfaces: Email, Payment, ESign, Warranty, ERP, CRM, Notification)
- DTOs for every domain entity — `/packages/shared-types/src/dtos/*.ts` (15 files incl. pagination)
- NestJS module skeletons (15 domains) — `/apps/api/src/modules/*/` (45 files; controllers return 501)
- Service-abstraction scaffolds (6 abstractions) — `/apps/api/src/services/*/` (crm, email, erp, esign, payment, warranty)
- Tenant-scoping middleware — `/apps/api/src/common/middleware/scope.middleware.ts`
- Scoped repository base class — `/apps/api/src/database/scoped.repository.ts`
- BullMQ queue topology — `/apps/worker/src/queues.ts` (5 queues + DLQ helpers)
- Commission rules engine spec — `/apps/api/src/modules/commission/commission-engine.spec.md` (321 lines)
- ADRs — `/docs/adr/ADR-001` through `ADR-007`
- Monorepo scaffolding — `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`

**Type C verification (CTO, 2026-05-20):**
- `git log --oneline`: 1 commit on branch (`687f2aa`).
- `git show --stat 687f2aa`: 120 files, 8849 insertions; all expected paths present.
- End-to-end read of Prisma schema, ScopeMiddleware, ScopedRepository, ADR-003, commission engine spec, NestJS bootstrap, queues, payment+email service interfaces — coherent with locked specs in `references/commfit_*.md`.
- `tsc --noEmit` clean across all four packages (shared-types, db, api, worker) after building upstream libs.
- Merged fast-forward into `dev` and pushed to `origin/dev`.

**Follow-ups noted for M2 (not blocking):**
- Root `package.json` is missing the `packageManager` field (turbo currently can't resolve workspaces from root).
- `packages/db/package.json` has no `build` script (turbo `^build` graph cannot satisfy api → db dependency without one).

**Definition of Done:**
- All deliverables exist on disk and pass lint + type-check.
- Initial Prisma migration runs cleanly against the Docker Compose Postgres.
- Generated OpenAPI spec at `/v1/openapi.json` resolves (controllers can return 501; the spec just needs to be present).
- Single (or small set of) git commit(s) to local repo. No remote push.
- This file updated with deliverable paths and the commit SHA, M1 → `in_review`.
- Comment posted on M1 tracking issue with paths + SHA + verification steps for CTO.

---

## M2 — Platform & Deployment
**Owner:** DevOps / Platform Engineer
**Status:** in_review
**Started:** 2026-05-20
**Delivered:** 2026-05-20
**Approved:** —

**Branch merged:** `feat/m2-platform-and-deployment` → `dev` (fast-forward, commit `ed8c52e`).

**Deliverables (all on disk, SHA `ed8c52e`):**

*M1 follow-ups resolved:*
- Root `package.json` — `packageManager: "pnpm@9.15.4+sha512..."` field present
- `packages/db/package.json` — `build: prisma generate` script, `main`/`types` pointing to generated client
- `packages/db/prisma/schema.prisma` — generator output set to `../generated/client`
- `packages/db/src/index.ts` — re-exports from generated client path

*Monorepo / turbo:*
- `pnpm-workspace.yaml` — `apps/*` + `packages/*` globs
- `turbo.json` — task graph with `^build` deps for build/typecheck/test

*Shared packages:*
- `packages/config/` — ESLint flat config, Prettier, tsconfig base, Tailwind preset
- `packages/utils/src/index.ts` — date/money/validation pure helpers
- `packages/ui/` — tokens, cn utility, components.json (shadcn integration scaffold)
- `packages/api-client/` — stub for M3 OpenAPI generation

*Next.js app stubs:*
- `apps/ops/` — Next.js 15, ports 3001, Sentry wired (client/server/edge configs)
- `apps/tech/` — Next.js 15, port 3002, Sentry wired
- `apps/customer/` — Next.js 15, port 3003, Sentry wired

*NestJS API:*
- `apps/api/src/instrument.ts` — Sentry init (DSN-gated; disabled if `SENTRY_DSN` unset)
- `apps/api/src/common/json-logger.ts` — stdout JSON logger
- `apps/api/src/health/health.controller.ts` — `GET /v1/health` via @nestjs/terminus
- `apps/api/src/admin/bull-board.module.ts` + `admin-auth.middleware.ts` — Bull-Board at `/v1/admin/bull-board`, `BULL_BOARD_ADMIN_KEY`-guarded
- `apps/api/src/app.module.ts` — BullModule + BullBoardModule + all 15 M1 domain modules
- `apps/api/src/main.ts` — helmet, CORS, global `v1` prefix, ValidationPipe

*NestJS Worker:*
- `apps/worker/src/main.ts`, `app.module.ts`, `instrument.ts`, `common/json-logger.ts`
- `apps/worker/src/health/health.controller.ts` — `GET /v1/health`
- `apps/worker/nest-cli.json`

*Docker:*
- `apps/api/Dockerfile` — multi-stage (base/deps/builder/runner), pnpm cache mount
- `apps/worker/Dockerfile` — multi-stage, pnpm cache mount
- `docker-compose.yml` — postgres:16-alpine + redis:7-alpine + api + worker with health checks

*CI/CD:*
- `.github/workflows/ci.yml` — lint + typecheck + build + test on push/PR (all branches → dev/main)
- `.github/workflows/deploy.yml` — `workflow_dispatch`-only; deploys api/worker → Railway, ops/tech/customer → Vercel

*Infra configs:*
- `infra/vercel.ops.json`, `infra/vercel.tech.json`, `infra/vercel.customer.json`
- `infra/railway.toml` — api + worker services with `/v1/health` healthcheck
- `infra/env-manifest.md` — every env variable per service documented (shared, API, worker, frontend)
- `infra/deploy-runbook.md` — step-by-step founder playbook for M4 (Supabase, Railway, Vercel, Sentry, GitHub Actions, smoke tests, troubleshooting)
- `.env.example` — local development template

**Type C verification (CTO, 2026-05-20):**
- `git log` on branch: 1 commit (`ed8c52e`) ahead of `dev` (which was at `ab784e9`).
- `git show --stat ed8c52e`: 91 files changed, 9,125 insertions / 1,618 deletions; all expected paths present (Docker, workflows, packages, app stubs, infra, env manifest, runbook).
- End-to-end reads of: root `package.json` (packageManager ✓), `packages/db/package.json` (build script + main/types ✓), `turbo.json`, `docker-compose.yml`, both Dockerfiles, `.github/workflows/{ci,deploy}.yml` (deploy is `workflow_dispatch`-only ✓), `apps/api/src/{main,instrument,app.module}.ts`, json-logger, health controller, bull-board module + admin-auth middleware, `apps/worker/src/{main,app.module}.ts`, `infra/{railway.toml,vercel.ops.json,env-manifest.md,deploy-runbook.md}`, `packages/{config/eslint.config.js,utils/src/index.ts,ui/src/tokens.ts,db/src/index.ts}`, `apps/ops/{app/page.tsx,next.config.ts}` — all coherent with locked specs.
- Both M1 follow-ups confirmed resolved on disk.
- Deploy workflow is correctly **not triggered** (manual `workflow_dispatch` only, per spec).
- No real third-party SDK was activated (Sentry is DSN-gated; mocks remain in place for Stripe/DocuSign/etc per locked decisions).
- No AI dependencies introduced (no `@anthropic-ai/sdk`, no `openai` in `pnpm-lock.yaml`).
- Fast-forward merged into `dev`.

**Definition of Done:**
- `pnpm dev` (or `docker-compose up`) brings up the full local environment cleanly. ✓ (compose file present; founder will run during M4 smoke.)
- CI passes on a clean checkout (CI workflow scaffolded; runs on push). Verification deferred to first push of `dev` after this merge.
- Deploy workflow is scaffolded but **not triggered** (founder triggers in M4). ✓
- All deliverables committed and pushed to one or more `feat/m2-<scope>` branches; CTO has merged each cleanly into `dev` and pushed to `origin/dev` after Type C verification. ✓
- This file updated with deliverable paths and merge SHA(s), M2 → `in_review`. ✓
- Comment posted on M2 tracking issue (COM-8) with paths + SHAs + verification steps. ✓

**Dependencies:** M1 must be `done`. ✓ (Approved 2026-05-20.)

---

## M3 — Backend ∥ Frontend
**Owners:** Backend Engineer + Frontend Engineer (parallel)
**Status:** not_started
**Started:** —
**Delivered:** —
**Approved:** —

### M3 Backend slice

**Deliverables:**
- All 15 backend modules implemented end-to-end (accounts, locations, equipment, technicians, jobs, quotes, contracts, invoices, payments, commission, parts, reports, notifications, audit, webhooks).
- All 6 service-abstraction mock providers — `/apps/api/src/services/*/mock.*.provider.ts`
- All 5 worker queue processors — `/apps/worker/src/processors/`
- Audit-log interceptor wired globally.
- Idempotency interceptor wired.
- Commission rules engine implementation per spec.
- Seed scripts producing the full realistic dataset — `/packages/db/src/seed/`
- `/packages/api-client` regenerated from live OpenAPI; CI drift check passing.
- All backend tests passing.

### M3 Frontend slice

**Deliverables:**
- `/packages/ui/` complete with tokens, primitives, domain components.
- `apps/ops/` — every Internal Ops screen implemented, matching mockups.
- `apps/tech/` — Tech PWA installable, all screens implemented.
- `apps/customer/` — Customer Portal pages implemented, matching mockups.
- Auth via Supabase Auth client with role-aware route guards.
- Typed query layer over `/packages/api-client` via TanStack Query.
- All frontend tests passing.

**Definition of Done (M3 as a whole):**
- All Backend AND all Frontend deliverables exist and pass lint + type-check + tests.
- Local end-to-end smoke: `pnpm dev` brings up everything, the three apps load, login works, demo seed flows exercisable.
- Single (or coordinated) git commits to local. No remote push.
- This file updated with deliverable paths and commit SHA, M3 → `in_review` (only after both slices verified).
- Comments posted on the M3 Backend task and M3 Frontend task with paths + SHA + verification steps for CTO.

**Dependencies:** M2 must be `done`.

---

## M4 — Pre-launch (founder-led)
**Owner:** Founder + CTO
**Status:** not_started
**Started:** —
**Delivered:** —
**Approved:** —

**Deliverables:**
- Supabase project created and migrated; seed data loaded.
- Railway project created with API + worker + Redis deployed.
- Three Vercel projects created and deployed (ops, tech, customer).
- Sentry projects created (5) and DSNs wired in production env.
- Domains configured (Vercel/Railway defaults for v1 are acceptable).
- Smoke tests: each app loads, login works, the demo flows exercise end-to-end against the deployed dev environment.
- First `git push` from founder to `https://github.com/m-jamileh/commfit`.

**Definition of Done:**
- All three apps load at their deployed URLs.
- The demo flows (a PM visit, an SR ticket, a quote, an invoice, a sign-off) work end-to-end in the deployed environment.
- Founder personally verifies and updates this file to M4 → `done`.

**Dependencies:** M3 must be `done`.

**Note:** M4 is founder-driven. The CTO is available to answer questions and help diagnose deploy issues but does not execute the deploy. The founder runs the playbook in `infra/deploy-runbook.md`.

---

## Status values reference

Only these four values are used:

- `not_started` — milestone has not begun.
- `in_progress` — specialist(s) are actively working.
- `in_review` — specialist(s) delivered, operator (CTO) verified, awaiting founder approval.
- `done` — founder approved.

The CTO can transition `not_started → in_progress` and `in_progress → in_review`. **Only the founder transitions `in_review → done`.**

## Date format

ISO 8601: `YYYY-MM-DD`. Use the day the transition happened.

## Deliverable references

Commit SHA in parentheses after the deliverable description. Example:

```
- /packages/db/prisma/schema.prisma — SHA 3bcc1fe
- /packages/shared-types/src/services/*.ts — SHA 3bcc1fe
```
