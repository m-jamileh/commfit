# Milestone State

Last updated: 2026-05-20 (M1 done / M2 in_progress)

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

**Branch:** `feat/m2-platform-and-deployment`
**Commit SHA:** `ed8c52e`

**Deliverables:**
- pnpm monorepo configured — `pnpm-workspace.yaml` (ed8c52e), root `package.json` with `packageManager: pnpm@9.15.4` (ed8c52e), `turbo.json` (ed8c52e)
- `packages/db/package.json` — `build: prisma generate`, custom client output `./generated/client` (ed8c52e)
- Shared config package — `/packages/config/` (eslint.config.js, prettier.config.js, tsconfig.base.json, tailwind.preset.ts) — (ed8c52e)
- UI package scaffold — `/packages/ui/` (tokens, cn utility, components.json) — (ed8c52e)
- Utils package scaffold — `/packages/utils/` (date/money/validation helpers) — (ed8c52e)
- API-client stub — `/packages/api-client/` (scaffold for M3 OpenAPI generation) — (ed8c52e)
- Dockerfiles — `apps/api/Dockerfile` (ed8c52e), `apps/worker/Dockerfile` (ed8c52e)
- Local-dev orchestration — `docker-compose.yml` at repo root (Postgres 16 + Redis 7 + api + worker) — (ed8c52e)
- GitHub Actions CI — `.github/workflows/ci.yml` (ed8c52e)
- GitHub Actions deploy (manual-trigger only) — `.github/workflows/deploy.yml` (ed8c52e)
- Hosting configs — `infra/vercel.ops.json`, `infra/vercel.tech.json`, `infra/vercel.customer.json`, `infra/railway.toml` — (ed8c52e)
- Env manifest — `infra/env-manifest.md` (ed8c52e)
- Deploy runbook — `infra/deploy-runbook.md` (ed8c52e)
- Sentry wired: api (`apps/api/src/instrument.ts`), worker (`apps/worker/src/instrument.ts`), ops/tech/customer (`sentry.{client,server,edge}.config.ts`) — (ed8c52e)
- Bull-Board at `/v1/admin/bull-board` with `BULL_BOARD_ADMIN_KEY` guard — (ed8c52e)
- Health endpoints: api `/v1/health` (ed8c52e), worker `/v1/health` (ed8c52e)
- Stdout JSON logging: `apps/api/src/common/json-logger.ts`, `apps/worker/src/common/json-logger.ts` — (ed8c52e)
- Next.js app stubs: `apps/ops/`, `apps/tech/`, `apps/customer/` with Sentry + next.config.ts — (ed8c52e)
- Sentry wired in all 5 services
- Bull-Board exposed at `apps/api/v1/admin/bull-board` (admin-guarded)
- Health endpoints — `/v1/health` on api + worker
- Stdout JSON logging via NestJS logger override

**Definition of Done:**
- `pnpm dev` (or `docker-compose up`) brings up the full local environment cleanly.
- CI passes on a clean checkout (run on the pushed `feat/m2-<scope>` branch + on `dev` after merge).
- Deploy workflow is scaffolded but **not triggered** (founder triggers in M4).
- All deliverables committed and pushed to one or more `feat/m2-<scope>` branches; CTO has merged each cleanly into `dev` and pushed to `origin/dev` after Type C verification (continuous push-and-PR workflow per revised governance).
- This file updated with deliverable paths and merge SHA(s), M2 → `in_review`.
- Comment posted on M2 tracking issue with paths + SHAs + verification steps for CTO.

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
