# Comm-Fit Environment Variable Manifest

This document is the authoritative reference for every environment variable used across all Comm-Fit services. Keep it in sync when adding or removing variables.

---

## Table of Contents

1. [Shared / Database](#shared--database)
2. [API Service](#api-service)
3. [Worker Service](#worker-service)
4. [Frontend Apps (ops, tech, customer)](#frontend-apps-ops-tech-customer)
5. [Mock Value Conventions](#mock-value-conventions)
6. [Secret Management Notes](#secret-management-notes)

---

## Shared / Database

Variables consumed by both `api` and `worker` services.

| Variable | Description | Example | Secret | Required |
|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Local uses the docker-compose Postgres instance. Production uses the Supabase connection pooler (Transaction mode, port 6543). | `postgresql://commfit:commfit@localhost:5432/commfit` | **Yes** | Yes |
| `REDIS_URL` | Redis connection string. Local uses the docker-compose Redis instance. Production uses the Railway Redis add-on URL. | `redis://localhost:6379` | **Yes** | Yes |
| `NODE_ENV` | Runtime environment selector. Controls logging verbosity, error handling, and feature flags. | `development` \| `production` \| `test` | No | Yes |

**Local values:** Set these in `.env.local` at the repo root (gitignored). The docker-compose defaults are shown in the Example column.

**Production values:** `DATABASE_URL` is the Supabase pooler URL (Settings → Database → Connection string → Transaction mode). `REDIS_URL` is the Railway Redis private URL.

---

## API Service

Variables for `apps/api`. Set in Railway as service-level environment variables.

| Variable | Description | Example | Secret | Required | Notes |
|---|---|---|---|---|---|
| `PORT` | HTTP port the API server listens on. Railway injects this automatically; override only in local dev. | `3000` | No | Yes | Railway sets this; do not hardcode in Railway env. |
| `NODE_ENV` | See Shared above. | `production` | No | Yes | Set to `production` in Railway. |
| `DATABASE_URL` | See Shared above. | `postgresql://...@db.supabase.co:6543/postgres` | **Yes** | Yes | Use Supabase connection pooler URL in production. |
| `REDIS_URL` | See Shared above. | `redis://default:password@monorail.proxy.rlwy.net:PORT` | **Yes** | Yes | Copy from Railway Redis add-on variables tab. |
| `SENTRY_DSN` | Sentry DSN for the `api` Sentry project. Leave empty to disable Sentry. | `https://abc123@o123.ingest.sentry.io/456` | **Yes** | No | Create a "Node.js" project named `commfit-api` in Sentry. |
| `SENTRY_TRACES_SAMPLE_RATE` | Float between 0 and 1 controlling transaction trace sampling. Lower values reduce Sentry quota usage. | `0.1` | No | No | Default: `0.1`. Set to `1.0` only in staging. |
| `BULL_BOARD_ADMIN_KEY` | Secret key for the Bull-Board admin UI (`/queues`). Sent as `X-Admin-Key` header. Rotate if exposed. | `a-long-random-string` | **Yes** | Yes | Generate with `openssl rand -hex 32`. |
| `CORS_ORIGINS` | Comma-separated list of allowed CORS origins. Must match the deployed Vercel URLs exactly (no trailing slash). | `https://commfit-ops.vercel.app,https://commfit-tech.vercel.app,https://commfit-customer.vercel.app` | No | Yes | Update when custom domains are added. |
| `SUPABASE_URL` | Supabase project URL. Found in Supabase dashboard → Settings → API. | `https://xyzabc.supabase.co` | **Yes** | Yes | Same value as `NEXT_PUBLIC_SUPABASE_URL` but kept secret server-side. |
| `SUPABASE_ANON_KEY` | Supabase anon (public) key. Safe to expose in client code but stored as env var for consistency. | `eyJhbGci...` | No | Yes | Found in Supabase → Settings → API → Project API keys. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key. Bypasses Row-Level Security. Never expose to the client. | `eyJhbGci...` | **Yes** | Yes | Found in Supabase → Settings → API → Project API keys. Treat like a root password. |
| `SUPABASE_JWT_SECRET` | JWT secret used to validate Supabase-issued access tokens on the API side. | `your-supabase-jwt-secret` | **Yes** | Yes | Found in Supabase → Settings → API → JWT Settings. |

---

## Worker Service

Variables for `apps/worker`. Set in Railway as service-level environment variables.

| Variable | Description | Example | Secret | Required | Notes |
|---|---|---|---|---|---|
| `WORKER_PORT` | HTTP port for the worker's health-check endpoint (`/v1/health`). | `3001` | No | Yes | Default: `3001`. Railway uses this for health checks defined in `railway.toml`. |
| `NODE_ENV` | See Shared above. | `production` | No | Yes | |
| `DATABASE_URL` | See Shared above. Identical value to the API service. | `postgresql://...@db.supabase.co:6543/postgres` | **Yes** | Yes | |
| `REDIS_URL` | See Shared above. Identical value to the API service. | `redis://default:password@monorail.proxy.rlwy.net:PORT` | **Yes** | Yes | |
| `SENTRY_DSN` | Sentry DSN for the `worker` Sentry project. | `https://def456@o123.ingest.sentry.io/789` | **Yes** | No | Create a separate "Node.js" project named `commfit-worker` in Sentry. |

---

## Frontend Apps (ops, tech, customer)

Each of the three Next.js apps has an identical variable shape. Variables are set in Vercel per-project. `NEXT_PUBLIC_*` variables are baked into the client bundle at build time; the others are only available server-side (SSR/Edge).

> Note: Vercel environment variables can be set via the dashboard (Project → Settings → Environment Variables) or via the `vercel env add` CLI. The `infra/vercel.*.json` files reference Vercel secret names (prefixed with `@`) — these must be created in your Vercel team's Integrations → Environment Variables store before deploying.

| Variable | Description | Example | Secret | Required | Notes |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL, exposed to the browser. Same value as `SUPABASE_URL`. | `https://xyzabc.supabase.co` | No | Yes | Baked into the client bundle. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key, exposed to the browser. | `eyJhbGci...` | No | Yes | Baked into the client bundle. Safe to expose. |
| `NEXT_PUBLIC_API_URL` | Base URL for the Comm-Fit API, exposed to the browser. Local: `http://localhost:3000`. | `https://commfit-api.up.railway.app` | No | Yes | No trailing slash. Used by `@commfit/sdk`. |
| `NEXT_PUBLIC_SENTRY_DSN` | Public Sentry DSN for client-side error reporting. | `https://abc123@o123.ingest.sentry.io/456` | No | No | Use the same DSN as `SENTRY_DSN` for the corresponding app. |
| `SENTRY_DSN` | Server-side Sentry DSN (used by SSR and Edge runtime). | `https://abc123@o123.ingest.sentry.io/456` | **Yes** | No | Per-app Sentry project DSN. Each app has its own Sentry project (`commfit-ops`, `commfit-tech`, `commfit-customer`). |
| `SENTRY_ORG` | Sentry organisation slug. Used by the Sentry webpack plugin for source-map uploads. | `commfit` | No | No | Found in Sentry → Organisation Settings → Organisation Slug. |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source-map uploads during `next build`. Shared across all three apps. | `sntrys_...` | **Yes** | No | Create in Sentry → Settings → Auth Tokens. Needs `project:releases` and `org:read` scopes. |

### Per-App Differences

| App | `NEXT_PUBLIC_API_URL` Vercel Secret | `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` Vercel Secret |
|---|---|---|
| ops | `@commfit-ops-api-url` | `@commfit-ops-sentry-dsn` |
| tech | `@commfit-tech-api-url` | `@commfit-tech-sentry-dsn` |
| customer | `@commfit-customer-api-url` | `@commfit-customer-sentry-dsn` |

Shared secrets (`@commfit-supabase-url`, `@commfit-supabase-anon-key`, `@commfit-sentry-org`, `@commfit-sentry-auth-token`) are the same across all three apps.

---

## Mock Value Conventions

Deferred subsystem mocks use a `mock_` prefix **in database column values**, not in environment variables. These are generated by mock provider implementations (Stripe mock, DocuSign mock, etc.) at runtime.

| Prefix | Subsystem | Example Value | Column(s) |
|---|---|---|---|
| `mock_pm_` | Stripe payment method | `mock_pm_xxxx` | `payment_methods.provider_id` |
| `mock_env_` | DocuSign envelope | `mock_env_xxxx` | `contracts.docusign_envelope_id` |
| `mock_ch_` | Stripe charge / payment intent | `mock_ch_xxxx` | `invoices.stripe_charge_id` |
| `mock_sub_` | Stripe subscription | `mock_sub_xxxx` | `subscriptions.stripe_subscription_id` |

These values are **not** environment variables. They exist only in the database and are handled transparently by mock provider factories. No special environment configuration is needed to use them.

---

## Secret Management Notes

1. **Never commit secrets.** All secret variables must be stored in Railway (for API/worker) or Vercel (for frontend apps), or in a secrets manager. The `.env.local` file is gitignored and used for local development only.

2. **Rotation:** Rotate `SUPABASE_SERVICE_ROLE_KEY`, `BULL_BOARD_ADMIN_KEY`, and `SENTRY_AUTH_TOKEN` immediately if any of them are exposed in logs, PRs, or error reports.

3. **Vercel secret references:** The `infra/vercel.*.json` files use `@secret-name` syntax. These must be provisioned in your Vercel team before a deployment will succeed. Use `vercel secrets add <name> <value>` or the Vercel dashboard.

4. **Railway variable groups:** Consider creating a Railway variable group named `commfit-shared` containing `DATABASE_URL`, `REDIS_URL`, and `NODE_ENV`, then linking both the `api` and `worker` services to it to avoid duplication.

5. **Local development:** Copy `.env.example` (when created) to `.env.local` and fill in local values. The docker-compose stack provides Postgres and Redis with the default local credentials shown in the examples above.
