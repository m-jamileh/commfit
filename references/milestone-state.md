# Milestone State

Last updated: 2026-05-21 (M1 done / M2 done / M3 done / M4 in_progress — pre-flight prep merged, founder-led deploy outstanding)

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
**Status:** done
**Started:** 2026-05-20
**Delivered:** 2026-05-20
**Approved:** 2026-05-20

**Branch merged:** `feat/m2-platform-and-deployment` → `dev` (fast-forward, commit `ed8c52e`; follow-up fix-up cherry-picked, commit `0fbc154`).

**Deliverables (all on disk, SHA `ed8c52e` + follow-up fix-up `0fbc154`):**

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

**Follow-up fix-up verification (CTO, 2026-05-20, SHA `0fbc154`):**
- `git show --stat 0fbc154`: 25 files changed, 440 insertions / 57 deletions; only ESLint flat-config rename (`.js` → `.mjs`), `apps/api` adds `@nestjs/swagger` + workspace deps it was already importing, `next lint` → `eslint .` (Next.js 15 deprecated `next lint`), jest `--passWithNoTests` on api/worker, `.gitignore` adds `next-env.d.ts` + `*.tsbuildinfo`, and `pnpm-lock.yaml` regen.
- `no-namespace` rule gains `allowDeclarations: true` — legitimately required by `apps/api/src/common/middleware/scope.middleware.ts` (M1) which uses `declare global { namespace Express { ... } }` to extend `Request` with `tenantScope`. Verified in file.
- `pnpm-lock.yaml` diff inspected: only adds `@commfit/db`, `@commfit/shared-types` (workspace links) and `@nestjs/swagger` to the api importer. No AI deps, no real third-party SDKs.
- Cherry-picked onto `dev` (milestone-state.md kept at dev's version; resolved cleanly).
- All other deliverables from `ed8c52e` untouched.

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
**Status:** done
**Started:** 2026-05-20
**Delivered:** 2026-05-21
**Approved:** 2026-05-20

**Merge SHAs on `dev` (in order):**
- Backend slice — `452091a` (modules/services/seeds, BE tip `8d72ca9`); OpenAPI delta merge following `e924fc3`.
- Frontend slice — `07f576f` (initial, BE tip `b482a51`); delta merge `c9bdf53` (BE tip `62ca64b`).
- CI lint cleanup — `43bd142` (`feat/m3-frontend-lint-cleanup` @ `52b60fd`); CTO Type C record `f9762b3`.
- CI prisma-generate fix — `04a4704` (`feat/m3-ci-prisma-generate` @ `b12deff`).

**Current `dev` tip:** `04a4704` (synced with `origin/dev`).

### M3 Backend slice

**Status:** in_review (CTO Type C verified; awaiting Frontend slice + joint smoke before M3 → `in_review` overall)
**Branch merged:** `feat/m3-backend-modules-and-services` → `dev` (two no-ff merges; latest folds in the OpenAPI delta).
**Branch tip SHA:** `e4af65e` (OpenAPI delta on top of `8d72ca9`: adds `apps/api/src/generate-openapi.ts`, committed `v1/openapi.json`, generated `packages/api-client/src/schema.ts`, and CI drift check).
**Tracking issue:** [COM-16](/COM/issues/COM-16) (replacement for zombie COM-11). Final closure recorded on [COM-17](/COM/issues/COM-17) due to second sticky execution lock on COM-16.

**Deliverables (all present at SHA `e4af65e`):**
- All 15 backend modules implemented end-to-end — `/apps/api/src/modules/*/` (accounts, locations, equipment, technicians, jobs, quotes, contracts, invoices, payments, commission, parts, reports, notifications, audit, webhooks)
- All 6 service-abstraction mock providers — `/apps/api/src/services/*/mock.*.provider.ts` (email, payment, esign, warranty, erp, crm)
- All 5 worker queue processors — `/apps/worker/src/processors/` (email-dispatch, scheduled-pm-rollover, recurring-autopay-simulation, commission-recompute, audit-async)
- AuditLogInterceptor + AuditInterceptor wired globally — `/apps/api/src/common/interceptors/{audit-log,audit}.interceptor.ts`
- IdempotencyInterceptor wired globally with 24h TTL — `/apps/api/src/common/interceptors/idempotency.interceptor.ts`
- CommissionEngineService + unit tests — `/apps/api/src/modules/commission/commission-engine.{service,spec}.ts`
- Swagger/OpenAPI mounted live at `/v1/openapi.json` — `/apps/api/src/main.ts`
- OpenAPI spec generator (no live infra needed) — `apps/api/src/generate-openapi.ts`
- Committed OpenAPI 3.0 spec — `v1/openapi.json` (documents all 15 modules + health)
- Generated api-client TypeScript schema — `packages/api-client/src/schema.ts` (re-exported via `packages/api-client/src/index.ts`)
- CI OpenAPI drift check — `.github/workflows/ci.yml` (fails CI if `v1/openapi.json` or `schema.ts` drifts)
- Seed scripts producing full realistic dataset — `/packages/db/src/seed/` (accounts, locations, equipment, technicians, users, jobs, parts, commission-rules, index.ts)
- `pnpm db:seed` root script wired; `pnpm api:regenerate` + `pnpm api:generate-spec` root scripts added

**Type C verification (CTO, 2026-05-20):**

Pass 1 — modules/services/seeds slice (SHA `8d72ca9`):
- `git log --oneline da85f3b..8d72ca9`: 4 commits (`f7cf96d` → `9f56d15` → `b29a7a0` → `8d72ca9`), all carry the `Co-Authored-By: Paperclip` footer.
- `git diff --stat da85f3b..8d72ca9`: **87 files changed, 7,210 insertions / 301 deletions**; every claimed path present (15 modules, 6 mock providers, 5 processors, 3 interceptors, 9 seed files incl. index + commission-rules).
- End-to-end read of `apps/api/src/app.module.ts` — 15 domain modules + 6 service modules registered; `IdempotencyInterceptor` + `AuditInterceptor` + `AuditLogInterceptor` wired via `APP_INTERCEPTOR`.
- Spot-check of `apps/api/src/modules/commission/commission-engine.service.ts` — priority-ordered rule matching, four-axis filter evaluation (techType / jobType / equipmentClass / technicianId), trace logging with `RuleTrace` struct; coherent with `commission-engine.spec.md`.
- `pnpm-lock.yaml` grep for `@anthropic-ai/sdk` / `openai`: **0 matches** (AI-free constraint upheld).
- Service abstractions remain mocks-only — no real third-party SDK wired (Stripe / DocuSign / Email / Warranty all behind `mock.*.provider.ts`).
- Workspace typecheck self-reported clean (11/11 tasks) by Backend Engineer at SHA `9f56d15`; CI on the merge commit will confirm against the merged tree.
- No-ff merged into `dev` as `452091a` and pushed to `origin/dev`.

Pass 2 — OpenAPI delta (SHA `e4af65e`):
- `git show --stat 6139d24`: 8 files / 7,067 insertions — generator script, committed spec (3,342 lines), generated schema (3,627 lines), CI drift step, root `api:generate-spec` script.
- End-to-end read of `apps/api/src/generate-openapi.ts` — bootstraps NestJS with `Test.createTestingModule({ imports: [AppModule] })`, overrides `PrismaService` with a Proxy and all 5 BullMQ queue tokens (`audit-async`, `commission-recompute`, `email-dispatch`, `scheduled-pm-rollover`, `recurring-autopay-simulation`) with a no-op mock; writes to `v1/openapi.json` without requiring Postgres/Redis. Queue names match `apps/worker/src/queues.ts`.
- Grep of committed `v1/openapi.json` path prefixes: **all 15 module routes documented** — accounts, audit, commission, contracts, equipment, invoices, jobs, locations, notifications, parts, payments, quotes, reports, technicians, webhooks (+ health).
- End-to-end read of `.github/workflows/ci.yml` — new `OpenAPI drift check` step runs `pnpm api:generate-spec && pnpm --filter @commfit/api-client generate && git diff --exit-code v1/openapi.json packages/api-client/src/schema.ts`; CI fails with a clear instruction (`run 'pnpm api:regenerate' and commit`) on drift.
- `packages/api-client/src/index.ts` cleanly re-exports `paths`, `components`, `operations` from `./schema` alongside `@commfit/shared-types`.
- No-ff merged into `dev` as the merge commit following `e924fc3` and pushed to `origin/dev`.

**Note:** COM-16 hit the same sticky execution-lock pattern as COM-11 (`executionRunId 23dd20fd-b526-4b2d-a679-5ce7d3adaf49`, no active run, all writes return `Issue run ownership conflict`). Final completion record + this SHA captured on [COM-17](/COM/issues/COM-17); COM-16 left as-is.

### M3 Frontend slice

**Branch:** `feat/m3-frontend-ui-package` — commits `ba23aa2` → `ef8c00c` → `62ca64b` (2026-05-20)

**Deliverables (all on disk, latest SHA `62ca64b`):**

*packages/ui — complete design system & shared library:*
- Design tokens (brand palette, General Sans/DM Sans/Geist Mono) — `packages/ui/src/tokens.ts`
- Tailwind preset updated — `packages/config/tailwind.preset.ts`
- 20 primitive components — `packages/ui/src/components/` (Button, Input, Select, Checkbox, Switch, Tabs, Card, Modal, Tooltip, Avatar, Pill, KPI, Sidebar, TopBar, PageHeader, StatusDot, AccentRail, Radio, Table, Toast)
- 11 domain components — `packages/ui/src/domain/` (JobCard, JobsBoard, VisitCard, VisitTimeline, EquipmentRow, TechAvailabilityRow, ActivityFeed, MapPreview, PropertyHero, SnapshotCard, CommissionRuleEditor)
- Supabase SSR auth lib + role-aware user type — `packages/ui/src/lib/auth.ts`, `supabase.ts`
- Realistic mock seed data (3 accounts, 8 properties, ~15 equipment, 5 techs, 15 jobs, invoices, contracts, quotes) — `packages/ui/src/lib/mock-data.ts`
- TanStack Query provider — `packages/ui/src/lib/query-client.tsx`
- 11 typed query hooks (jobs, accounts, locations, equipment, technicians, invoices, contracts, quotes, parts, reports, commission) — `packages/ui/src/hooks/use-*.ts`

*apps/ops — 15 screens:*
- Full sidebar+topbar shell — `apps/ops/app/ops-shell.tsx`, `layout.tsx`
- Dispatch kanban (showpiece) — `apps/ops/app/dispatch/page.tsx`
- Overview KPIs + charts — `apps/ops/app/overview/page.tsx`
- Jobs list with filters — `apps/ops/app/jobs/page.tsx`
- Quotes list — `apps/ops/app/quotes/page.tsx`
- Customers: Accounts / Properties / Equipment — `apps/ops/app/customers/*/page.tsx`
- Workforce: Technicians / Parts — `apps/ops/app/workforce/*/page.tsx`
- Finance: Invoices / Reports (6 tabs + CSV export) / Contracts — `apps/ops/app/finance/*/page.tsx`
- Settings: Commission rules editor / Email inbox — `apps/ops/app/settings/*/page.tsx`
- Login — `apps/ops/app/login/page.tsx`

*apps/tech — PWA, 6 screens:*
- PWA manifest + service worker — `apps/tech/public/manifest.json`, `apps/tech/public/sw.js`
- Mobile-first bottom-nav layout — `apps/tech/app/layout.tsx`
- Today's jobs — `apps/tech/app/today/page.tsx`
- Active job (checklist + camera capture) — `apps/tech/app/job/[id]/page.tsx`
- Customer sign-off — `apps/tech/app/sign-off/[id]/page.tsx`
- Parts request — `apps/tech/app/parts-request/page.tsx`
- History with commissions — `apps/tech/app/history/page.tsx`
- Login — `apps/tech/app/login/page.tsx`

*apps/customer — 7 screens:*
- Top-nav layout — `apps/customer/app/layout.tsx`
- Overview dashboard — `apps/customer/app/overview/page.tsx`
- Properties list — `apps/customer/app/properties/page.tsx`
- Property detail (hero + snapshot cards + tabbed history/equipment/invoices/PMs) — `apps/customer/app/properties/[id]/page.tsx`
- Service requests — `apps/customer/app/service-requests/page.tsx`
- Invoices — `apps/customer/app/invoices/page.tsx`
- Contracts — `apps/customer/app/contracts/page.tsx`
- Login — `apps/customer/app/login/page.tsx`

*Auth middleware (all three apps):*
- Session-based route guards — `apps/ops/middleware.ts`, `apps/tech/middleware.ts`, `apps/customer/middleware.ts`

**Build + Test:** `pnpm test` — 11/11 tasks successful (build + typecheck + jest backend), zero ESLint errors, all three Next.js apps compile cleanly (verified SHA `62ca64b`).

**Status:** in_review (CTO Type C verified; awaiting joint local smoke before M3 → `in_review` overall).
**Branch merged:** `feat/m3-frontend-ui-package` → `dev` (no-ff merge `07f576f`, pushed to `origin/dev`).
**Tracking issue:** [COM-12](/COM/issues/COM-12).

**Type C verification (CTO, 2026-05-20):**
- `git log --oneline origin/dev..origin/feat/m3-frontend-ui-package`: 2 commits (`ba23aa2` → `b482a51`), both carry the `Co-Authored-By: Paperclip` footer.
- `git show --stat ba23aa2`: **103 files changed, 8,748 insertions / 123 deletions** — every claimed path present (17 primitives, 10 domain components, 11 query hooks, mock seed, auth/supabase/query-client libs, 15 ops screens, 6 tech screens + PWA manifest/sw.js, 7 customer screens, Tailwind preset + globals.css/tailwind.config across all three apps).
- `git diff ba23aa2~1 ba23aa2 --name-only` for `apps/api/**`, `apps/worker/**`, `packages/db/**`, `packages/shared-types/**`: **empty** — Frontend slice did not touch any backend path (slice boundary respected).
- `pnpm-lock.yaml` diff grep for `anthropic` / `openai` / `@anthropic` / `claude-sdk`: **0 matches** (AI-free constraint upheld). New deps are `@supabase/ssr`, `@supabase/supabase-js`, `@tanstack/react-query`, `lucide-react`, `recharts`, `@radix-ui/*`, `tailwindcss`, `postcss`, `autoprefixer` — all expected for the design system.
- End-to-end reads: `packages/ui/src/tokens.ts` (brand palette `#F7F5F0` / `#16314D` / `#C3551A` matches locked spec), `packages/config/tailwind.preset.ts` (colors mirror tokens; fontFamily set to General Sans/DM Sans/Geist Mono), `packages/ui/src/index.ts` (barrel exports 17 primitives + 10 domain components + 11 hooks + tokens + auth + supabase + query-client), `packages/ui/src/lib/auth.ts` (`AppRole` union covers all 7 roles incl. customer/technician; `CommFitUser` + `parseUserRole` + `mockRoleFromEmail` for local dev), `packages/ui/src/lib/supabase.ts` (`createBrowserClient` from `@supabase/ssr`), `packages/ui/src/lib/query-client.tsx` (`CommFitQueryProvider` wraps `QueryClientProvider` with 30s stale / retry=1), `packages/ui/src/hooks/use-jobs.ts` (`useJobs` with filters + `useJob` + `useUpdateJobStatus` mutation; mock-backed — single-line swap to api-client when ready), `apps/ops/app/dispatch/page.tsx` (showpiece: KPI strip + JobsBoard kanban + TechAvailability list + ActivityFeed + MapPreview wired via `useJobs`/`useTechnicians`), `apps/tech/public/manifest.json` (PWA: `display: standalone`, theme `#16314D`, bg `#F7F5F0`, 192/512 icons), `apps/tech/public/sw.js` (install/activate/fetch handlers — minimal pass-through service worker), `apps/tech/app/sw-register.tsx` (client-side SW registration).
- `pnpm -r typecheck` on the merged tree: **11/11 projects pass** (`shared-types`, `utils`, `api-client`, `db`, `ui`, `api`, `worker`, `ops`, `tech`, `customer`, root; one workspace project — `packages/config` — has no typecheck script and is skipped).
- No-ff merged into `dev` as `07f576f` and pushed to `origin/dev`.

**Type C verification — delta pass (CTO, 2026-05-20):**
- Delta beyond already-merged `b482a51`: 3 commits — `ef8c00c` (add Radio/Table/Toast primitives + CommissionRuleEditor domain component + session-based auth middleware for all three apps + PWA icons + TS/lint fixes), `62ca64b` (remove unused `Settings`/`Mail` icon imports that blocked `next build`), `61aa437` (milestone-state.md update). All three carry the `Co-Authored-By: Paperclip` footer.
- `git diff --stat b482a51..origin/feat/m3-frontend-ui-package`: **24 files changed, 517 insertions / 19 deletions**.
- Slice-boundary check (`git diff --name-only b482a51..origin/feat/m3-frontend-ui-package | grep -E '^(apps/api|apps/worker|packages/db|packages/shared-types)/'`): **empty** — backend slice boundary respected.
- AI-free check on package.json changes in the delta: zero `package.json` changes; no new deps introduced.
- `pnpm --filter @commfit/ops lint`, `pnpm --filter @commfit/tech lint`, `pnpm --filter @commfit/customer lint`: **all three exit 0** with no warnings (ESLint blocker that `62ca64b` removed is genuinely fixed).
- Spot-check on new files: `packages/ui/src/components/radio.tsx` (RadioGroup + RadioGroupItem with proper React context + `role="radiogroup"`), `packages/ui/src/domain/commission-rule-editor.tsx` (real composition of Card/Button/Input/Switch/Pill/Select/Modal — 148 lines of working code), `apps/ops/middleware.ts` (Supabase SSR cookie check `commfit-ops-session`, redirect to `/login` if missing, exempts `_next`/`api`/`/login`).
- `pnpm -r typecheck` on the merged tree (`c9bdf53`): **11/11 projects pass** (initial run flagged stale pnpm workspace links on `apps/worker` after the branch switch; `pnpm install --frozen-lockfile` re-linked them; re-run was clean — no code regression).
- The CommissionRuleEditor carry-over note from the prior verification is **now resolved**: `ef8c00c` adds `packages/ui/src/domain/commission-rule-editor.tsx` and re-exports it from the barrel `packages/ui/src/index.ts`.
- No-ff merged into `dev` as `c9bdf53`; about to push to `origin/dev`.

**Type C verification — CI lint cleanup ([COM-18](/COM/issues/COM-18), CTO, 2026-05-20):**
- Founder noted on COM-6 that CI was red on `dev` post-merge due to 7 ESLint `no-unused-vars` errors in `packages/ui`. CTO opened [COM-18](/COM/issues/COM-18) (lint cleanup) assigned to Frontend Engineer.
- Branch `feat/m3-frontend-lint-cleanup` tip `52b60fd4` removes the 7 unused imports/consts across 6 files (`pill.tsx` VariantProps, `commission-rule-editor.tsx` Pencil, `job-card.tsx` MapPin, `map-preview.tsx` lucide MapPin + PIN_COLORS const, `visit-card.tsx` Wrench, `use-reports.ts` mockJobs/mockInvoices). 6 files / 5+ / 14-.
- Verified: `git ls-remote` + `git cat-file -t 52b60fd4` confirm SHA on origin. `pnpm --filter @commfit/ui lint` exits 0 (zero errors), `pnpm --filter @commfit/ui typecheck` clean, `pnpm -r typecheck` on merged tree 11/11 green. GitHub Actions CI run #21 (https://github.com/m-jamileh/commfit/actions/runs/26196716794) **completed / success** on SHA `52b60fd4`.
- No-ff merged into `dev`; will push to `origin/dev` with this record.

**Joint local smoke (CTO, 2026-05-21, on `dev` @ `04a4704`):**

*Infrastructure:*
- Postgres 16 via `brew services start postgresql@16` (already running; DB `commfit` reachable on `localhost:5432`).
- Redis 8.6.3 installed via `brew install redis` and started via `brew services start redis`; `redis-cli ping` → `PONG`.

*Static checks:*
- `pnpm typecheck` — **11/11 tasks pass** (`shared-types`, `utils`, `api-client`, `db`, `ui`, `api`, `worker`, `ops`, `tech`, `customer`, root).
- `pnpm lint` — **8/8 tasks pass** (zero ESLint errors across all packages and apps).
- `pnpm test` — **11/11 tasks pass**; api jest suite reports `Tests: 5 passed, 5 total` (CommissionEngineService); worker / others `--passWithNoTests`. All three Next.js apps build cleanly: ops **19/19** static pages, tech **8/8**, customer **10/10**.

*Database:*
- `pnpm db:seed` — clean run end-to-end: 3 accounts, 8 locations, 24 users, 60 equipment, 17 technicians, 45 jobs (15 completed / 5 in-progress / 20 scheduled / 5 urgent), 20 parts + 210 inventory records, 9 commission rules.

*API runtime (port 3000, `node apps/api/dist/main.js`):*
- All 15 module routers wired in startup logs — `accounts`, `locations`, `equipment`, `technicians`, `jobs`, `quotes`, `contracts`, `invoices`, `payments`, `commission`, `parts`, `reports`, `notifications`, `audit`, `webhooks` (+ `health`).
- `GET /v1/health` → `{"status":"ok"}`.
- `GET /v1/openapi.json` → valid OpenAPI 3.0.0 document served live (separate from the committed `v1/openapi.json` drift artifact).
- `GET /v1/jobs` with `x-account-id` header → returns real seeded jobs (verified ids, scheduled timestamps, technician references).
- `GET /v1/accounts` → 400 with `ValidationPipe` rejection of unknown query keys — confirms `ValidationPipe` global wiring.
- Logs confirm `Prisma connected` and `Nest application successfully started`.

*Worker runtime (port 3001 default, `node apps/worker/dist/main.js`):*
- All BullModule queues + processors loaded; `HealthController {/v1/health}` mapped.
- `GET /v1/health` → `{"status":"ok"}`.
- Logs confirm `Prisma connected` and `Nest application successfully started`.
- Known doc-only gotcha for the founder: `WORKER_PORT` default (3001) collides with `apps/ops` dev (3001) when running `pnpm dev` fully native; either `WORKER_PORT=3010` in `.env` or the `docker-compose up` path (worker runs in its own container) avoids it.

*Frontend runtimes (Next.js 15.5.18, `next start`):*
- `apps/ops` on `:3001` — ready in 358ms; `GET /` → 307 (auth middleware redirect), `GET /login` → 200 (8,110 bytes).
- `apps/tech` on `:3002` — ready in 340ms; `GET /` → 307, `GET /login` → 200.
- `apps/customer` on `:3003` — ready in 331ms; `GET /` → 307, `GET /login` → 200.
- All three apps were running concurrently against the live API on `:3000`; auth middleware behavior consistent across apps (session cookie missing → redirect to `/login`).

*Constraints reaffirmed in smoke:*
- AI-free: `pnpm-lock.yaml` grep for `@anthropic-ai/sdk` / `openai` / `claude-sdk` → 0 matches.
- Mocks-only third-party services: all 6 service abstractions remain behind `apps/api/src/services/*/mock.*.provider.ts`; no real Stripe / DocuSign / QuickBooks / email / SMS / warranty / supplier SDK loaded.
- Supabase project + Vercel/Railway deploys remain M4 (founder-led); frontend Supabase Auth client is wired against env-driven config but local smoke uses session-cookie fallback.

**Definition of Done (M3 as a whole):**
- All Backend AND all Frontend deliverables exist and pass lint + type-check + tests. ✓
- Local end-to-end smoke: `pnpm dev` brings up everything, the three apps load, login works, demo seed flows exercisable. ✓ (verified above)
- Single (or coordinated) git commits to local. No remote push. — N/A; continuous push-and-PR git flow per revised plan v2.
- This file updated with deliverable paths and commit SHA, M3 → `in_review` (only after both slices verified). ✓
- Comments posted on the M3 Backend task and M3 Frontend task with paths + SHA + verification steps for CTO. ✓ (`COM-16`, `COM-12`).

**Dependencies:** M2 must be `done`.

---

## M4 — Pre-launch (founder-led)
**Owner:** Founder + CTO
**Status:** in_progress (pre-flight prep delivered; founder-led deploy outstanding)
**Started:** 2026-05-20
**Delivered:** —
**Approved:** —

### M4 pre-flight prep (DevOps Engineer, COM-23)

**Branch merged:** `feat/m4-pre-flight-prep` → `dev` (no-ff merge `b750d1c`, pushed to `origin/dev`).
**Branch tip SHA:** `4c3907c`.
**Tracking issue:** [COM-23](/COM/issues/COM-23) (DevOps); sibling orchestration [COM-22](/COM/issues/COM-22) (CTO); parent [COM-21](/COM/issues/COM-21) (M4 tracking).

**Deliverables (at SHA `4c3907c`):**
- `infra/deploy-runbook.md` — added "Local Pre-Flight Checks" section (WORKER_PORT 3001/3010 collision gotcha, M3 root scripts `pnpm db:seed`/`api:generate-spec`/`api:regenerate`, native dev smoke sequence). Step 1.4 documents `pnpm db:seed` root alias. Step 2.4 adds `/v1/openapi.json` verification curl. Step 2.5 adds the worker health curl command.
- `infra/env-manifest.md` — added "GitHub Actions Secrets (CI/CD)" section documenting all six `${{ secrets.* }}` references in `.github/workflows/deploy.yml` (`RAILWAY_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_OPS_PROJECT_ID`, `VERCEL_TECH_PROJECT_ID`, `VERCEL_CUSTOMER_PROJECT_ID`) with `Set in: GitHub Actions secrets` annotation. Zero undocumented secrets remain.
- `.env.example` — `WORKER_PORT=3010` with collision comment; `SUPABASE_JWT_SECRET` and `CORS_ORIGINS` added (were in manifest but missing from example).
- `docker-compose.yml` — worker service now exposes `ports: ['3001:3001']` with `WORKER_PORT=3001` inside the container so `/v1/health` is reachable from host during local boot smoke.
- `apps/worker/src/main.ts` default unchanged (production canonical `WORKER_PORT=3001` per env-manifest.md and railway.toml — collision is local-dev only).

**Type C verification (CTO, 2026-05-21):**
- `git log --oneline origin/dev..4c3907c`: 2 commits (`114ec0a` chore + `4c3907c` runbook Step 2.5 curl fix-up), both carry the `Co-Authored-By: Paperclip` footer.
- `git diff --stat` from fork base `4ed0637`: 4 files / 109 insertions / 4 deletions — only the four expected pre-flight paths.
- Slice-boundary: no source code changed except `docker-compose.yml` worker port config; `apps/api/src/**`, `apps/worker/src/**`, `packages/**` source untouched.
- Cross-check item 3 — `grep -oE 'secrets\.[A-Z_]+' .github/workflows/deploy.yml | sort -u` returns exactly the six secrets now documented in env-manifest.md. Zero drift.
- End-to-end reads of `.env.example`, `docker-compose.yml`, `infra/deploy-runbook.md` (Local Pre-Flight Checks + Steps 1.4/2.4/2.5), `infra/env-manifest.md` (GH Actions Secrets table): coherent, accurate, founder-actionable.
- AI-free: zero `@anthropic-ai/sdk` / `openai` / `claude-sdk` references in `pnpm-lock.yaml` (no lockfile changes in this branch).
- CI on branch tip: GitHub Actions run #31 **completed / success** — https://github.com/m-jamileh/commfit/actions/runs/26199618122.
- Static checks reported by DevOps Engineer at SHA `4c3907c`: `pnpm lint` 8/8, `pnpm typecheck` clean across all packages, `pnpm test` 11/11 (api jest 5/5), `pnpm build` 9/9 force-run no-cache.
- 3-way merge into `dev` as `b750d1c` (preserves COM-20 `tech-availability-row.tsx` already on dev) and pushed to `origin/dev`.
- Docker image boot was explicitly deferred to founder/CI (Docker not available in the agent sandbox). Dockerfile structure (multi-stage builds, EXPOSE 3000/3001, CMD targets) reviewed manually by DevOps and confirmed correct. The live CI build of these images is the actual runtime path; the founder will run `docker compose up` as part of the M4 deploy-runbook smoke.

### M4 deploy (Founder-led, outstanding)

**Deliverables (founder runs `infra/deploy-runbook.md`):**
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

**Dependencies:** M3 must be `done`. ✓ (Approved 2026-05-20.)

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
