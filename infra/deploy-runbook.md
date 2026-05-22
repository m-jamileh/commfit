# Comm-Fit M4 Deployment Runbook

Step-by-step founder playbook for deploying the full Comm-Fit stack for the first time. Follow the sections in order — each one builds on the previous.

Estimated time: 2–3 hours for a first deployment.

---

## Placeholder Substitution Table

As you work through the steps, capture the values below in a scratch file or notes app. Commands throughout this runbook reference these placeholders — substitute your actual values wherever you see `<PLACEHOLDER>`.

| Placeholder | Captured after | Example |
|---|---|---|
| `<API_URL>` | Step 2.3 (Railway API deploy completes) | `https://api-production-9f18c.up.railway.app` |
| `<WORKER_URL>` | Step 2.5 (Railway Worker deploy completes) | `https://worker-production-9d2c.up.railway.app` |
| `<SUPABASE_URL>` | Step 1.2 | `https://<project-ref>.supabase.co` |
| `<SUPABASE_ANON_KEY>` | Step 1.2 | `eyJhbGci...` |
| `<SUPABASE_SERVICE_ROLE_KEY>` | Step 1.2 | `eyJhbGci...` |
| `<SUPABASE_JWT_SECRET>` | Step 1.2 | `<jwt-secret>` |
| `<DATABASE_URL>` | Step 1.2 | `postgresql://postgres.<ref>:<pw>@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |
| `<REDIS_URL>` | Step 2.2 (Railway Redis add-on) | `redis://default:<pw>@<host>.railway.internal:<port>` |
| `<SENTRY_DSN_API>` | Step 5.1 | `https://...@sentry.io/...` |
| `<SENTRY_DSN_WORKER>` | Step 5.1 | `https://...@sentry.io/...` |
| `<SENTRY_DSN_OPS>` | Step 5.1 | `https://...@sentry.io/...` |
| `<SENTRY_DSN_TECH>` | Step 5.1 | `https://...@sentry.io/...` |
| `<SENTRY_DSN_CUSTOMER>` | Step 5.1 | `https://...@sentry.io/...` |
| `<SENTRY_AUTH_TOKEN>` | Step 5.2 | `sntrys_...` |

---

## Prerequisites

You need accounts and CLI tools in place before starting.

### Accounts Required

| Service | Purpose | URL |
|---|---|---|
| GitHub | Source code, CI/CD | https://github.com |
| Supabase | Postgres + Auth + Storage | https://supabase.com |
| Railway | API + Worker deployment | https://railway.app |
| Vercel | Frontend deployment (3 apps) | https://vercel.com |
| Sentry | Error monitoring (5 projects) | https://sentry.io |

### CLI Tools Required

```bash
# Node.js 22+ and pnpm 9
node --version    # must be >= 22
pnpm --version    # must be >= 9.15.4

# Install if missing:
npm install -g pnpm@9.15.4

# Railway CLI
npm install -g @railway/cli
railway --version

# Vercel CLI
npm install -g vercel
vercel --version
```

### Repository Access

Ensure you have push access to the `commfit` GitHub repository. The default branch for production deploys is `main`; `dev` is the integration branch.

---

## Local Pre-Flight Checks

Run these on your machine before touching any production infrastructure. They verify the local stack is healthy and that M3 tooling works end-to-end.

### Port Collision Gotcha — WORKER_PORT

When running the full stack natively with `pnpm dev`, Next.js starts three dev servers:

| App | Default port |
|---|---|
| `apps/ops` | 3001 |
| `apps/tech` | 3002 |
| `apps/customer` | 3003 |

The worker's NestJS HTTP server defaults to port **3001** (`WORKER_PORT` env var). This creates a port collision with `apps/ops` when everything runs natively.

**Fix:** Copy `.env.example` to `.env.local` and keep `WORKER_PORT=3010`. This shifts the worker health endpoint to `http://localhost:3010/v1/health` in native dev without changing the production default (`3001` in `infra/env-manifest.md` and `railway.toml`).

```bash
cp .env.example .env.local
# Edit .env.local and fill in your Supabase / Redis / etc. values
# WORKER_PORT=3010 is already set in the example — leave it as-is
```

> **Docker Compose**: The docker-compose stack sets `WORKER_PORT=3001` inside the worker container and maps host port `3001:3001`. No collision because Next.js dev servers are not running inside Docker. Run `docker compose up` or keep native dev separate — do not mix them on the same host.

### M3 Root Scripts

The following scripts are available at the repo root and wrap the relevant package filters:

| Script | What it does |
|---|---|
| `pnpm db:seed` | Runs `packages/db` seed — creates demo company, users, and reference data. Equivalent to `pnpm --filter @commfit/db seed`. |
| `pnpm api:generate-spec` | Boots the API and writes `openapi.json` from the live Swagger document. Run this after any API contract change. |
| `pnpm api:regenerate` | Runs `api:generate-spec` then regenerates `packages/api-client` from the updated spec. |

Run these in order on a fresh checkout to verify M3 tooling:

```bash
# 1. Bring up infra (Postgres + Redis)
docker compose up postgres redis -d

# 2. Apply migrations
pnpm --filter @commfit/db migrate deploy

# 3. Seed demo data
pnpm db:seed

# 4. Start the API (separate terminal)
pnpm --filter @commfit/api start:dev

# 5. Generate the OpenAPI spec and regenerate the client
pnpm api:regenerate
# Verify: packages/api-client/dist/ is populated and packages/api-client/src/ is up to date

# 6. Verify health endpoints
curl http://localhost:3000/v1/health          # API
curl http://localhost:3010/v1/health          # Worker (native dev; port 3010 per .env.local)
curl http://localhost:3000/v1/openapi.json    # OpenAPI JSON (M3 addition)
```

---

## Step 1: Supabase Setup

### 1.1 Create the Supabase Project

1. Log in to https://supabase.com and go to your organisation.
2. Click **New project**.
3. Name: `commfit-prod` (or `commfit-staging` for a staging environment).
4. Database password: generate a strong password and **save it immediately** — you cannot retrieve it later.
5. Region: choose the region closest to your users (US East → `us-east-1`).
6. Click **Create new project** and wait ~2 minutes for provisioning.

### 1.2 Collect Supabase Credentials

Navigate to **Settings → API** and copy:

```
SUPABASE_URL              = https://<project-ref>.supabase.co
SUPABASE_ANON_KEY         = eyJhbGci...   (labeled "anon public")
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci...   (labeled "service_role")
```

> CAUTION: The `service_role` key bypasses Row-Level Security. Treat it like a root database password. Never expose it in client-side code or commit it to git.

Navigate to **Settings → API → JWT Settings** and copy:

```
SUPABASE_JWT_SECRET = <your-jwt-secret>
```

Navigate to **Settings → Database → Connection string** and select **Transaction mode** (port 6543):

```
DATABASE_URL = postgresql://postgres.<project-ref>:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

> Note: Use the **Transaction mode pooler URL** (port 6543), not the direct connection (port 5432). The direct connection is not appropriate for serverless/containerised workloads.

### 1.3 Run Database Migrations

From the repo root:

```bash
# Ensure your local .env.local has DATABASE_URL pointing to Supabase
export DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Run Prisma migrations
pnpm --filter @commfit/db migrate deploy
```

Verify the migration ran successfully:

```bash
pnpm --filter @commfit/db studio
# Opens Prisma Studio — confirm tables exist
```

### 1.4 Run Database Seed

```bash
# Either of these is equivalent:
pnpm db:seed
# or
pnpm --filter @commfit/db seed
```

This creates the demo company, demo users (Operations Manager, Technician, Customer), and baseline reference data (service types, equipment catalogue) required for the M4 smoke tests in Step 7.

### 1.5 Provision Supabase Storage — `job-photos` Bucket + RLS

The tech app uploads job photos directly to Supabase Storage. The API server never handles photo bytes — it only persists the resulting Storage URL. Complete this step before testing the photo upload feature.

**Apply the policy SQL:**

1. In the Supabase Dashboard, open your project and go to **SQL Editor → New query**.
2. Copy the entire contents of `packages/db/migrations/storage/job-photos-policy.sql` from the repo.
3. Paste and click **Run**. The script is idempotent — safe to re-run if needed.

What the script does:
- Creates a **private** bucket named `job-photos` (not public-read).
- Creates an INSERT policy scoped to the authenticated user's `account_id` JWT claim.
- Creates a SELECT policy with the same account-prefix scope.
- Service-role key bypasses RLS automatically; no extra policy is needed for the API server.

**Verify the bucket was created:**

In the Supabase Dashboard → **Storage** → confirm `job-photos` appears with **Public: false**.

Alternatively via the Supabase CLI (if configured locally):
```bash
supabase storage ls --project-ref <project-ref>
# Expected: job-photos bucket listed
```

**Path convention:** All uploads must follow `<accountId>/<jobId>/<photoId>.<ext>` so RLS path-prefix matching works correctly.

**JWT `account_id` claim prerequisite:** The policy relies on `auth.jwt() ->> 'account_id'` being present in the user's token. Confirm the Supabase Auth hook (or `app_metadata`) populates this claim for technician users. If the claim is missing, Storage uploads will be rejected with 403.

---

## Step 2: Railway Setup

### 2.1 Create the Railway Project

1. Log in to https://railway.app.
2. Click **New Project → Empty Project**.
3. Name the project `commfit-prod`.

### 2.2 Add Redis Add-on

1. Inside the project, click **+ New → Database → Redis**.
2. Railway will provision a Redis instance. Once ready, click on the Redis service and go to the **Variables** tab.
3. Copy the `REDIS_URL` value (the private URL, not the public proxy URL).

```
REDIS_URL = redis://default:<password>@<host>.railway.internal:<port>
```

### 2.3 Deploy the API Service

1. Click **+ New → GitHub Repo** and select the commfit repo.
2. Railway will detect the repo. When prompted for the service name, enter `api`.
3. Go to the service **Settings** tab:
   - Root directory: leave empty (build context is the repo root)
   - Dockerfile path: `apps/api/Dockerfile`
   - Start command: `node apps/api/dist/main.js`
4. Go to the **Variables** tab and add all required variables:

```
NODE_ENV                  = production
PORT                      = 3000
DATABASE_URL              = <Supabase pooler URL from Step 1.2>
REDIS_URL                 = <Railway Redis URL from Step 2.2>
SUPABASE_URL              = <from Step 1.2>
SUPABASE_ANON_KEY         = <from Step 1.2>
SUPABASE_SERVICE_ROLE_KEY = <from Step 1.2>
SUPABASE_JWT_SECRET       = <from Step 1.2>
BULL_BOARD_ADMIN_KEY      = <generate: openssl rand -hex 32>
CORS_ORIGINS              = https://commfit-ops.vercel.app,https://commfit-tech.vercel.app,https://commfit-customer.vercel.app
SENTRY_DSN                = <from Step 5 — add after Sentry is set up>
SENTRY_TRACES_SAMPLE_RATE = 0.1
```

5. Click **Deploy**. Watch the build logs — the first build may take 3–5 minutes.
6. Once deployed, note the Railway-assigned public URL. Save it as `<API_URL>` in your substitution table — you will use it as `NEXT_PUBLIC_API_URL` in the Vercel apps.

### 2.4 Verify API Health

> **Railway healthcheck gotcha — explicit `0.0.0.0` bind required.**
> Railway probes the public service interface, not loopback. Both `apps/api/src/main.ts` and `apps/worker/src/main.ts` must call `app.listen(port, '0.0.0.0')`. Using the single-argument form `app.listen(port)` causes the app to bind to `127.0.0.1` on some Nest versions, which makes Railway's healthcheck fail with "service unavailable" even though the process is running. This is already set correctly in the codebase — do not remove the second argument when editing `main.ts`.

```bash
curl <API_URL>/v1/health
# Expected: {"status":"ok","timestamp":"..."}

# The raw OpenAPI JSON is also available (M3 addition):
curl <API_URL>/v1/openapi.json | head -20
# Expected: {"openapi":"3.0.0","info":{"title":"Comm-Fit API", ...}}
```

### 2.5 Deploy the Worker Service

1. Inside the same Railway project, click **+ New → GitHub Repo** and select the commfit repo again.
2. Name this service `worker`.
3. Go to **Settings**:
   - Dockerfile path: `apps/worker/Dockerfile`
   - Start command: `node apps/worker/dist/main.js`
4. Go to **Variables** and add:

```
NODE_ENV     = production
WORKER_PORT  = 3001
DATABASE_URL = <same as API>
REDIS_URL    = <same as API>
SENTRY_DSN   = <from Step 5 — add after Sentry is set up>
```

5. Click **Deploy** and verify the health endpoint after the build completes. Save the Railway-assigned URL as `<WORKER_URL>` in your substitution table.

```bash
curl <WORKER_URL>/v1/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2.6 Save the Railway Token

For GitHub Actions to trigger deploys, you need a Railway API token:

1. Go to Railway → **Account Settings → Tokens**.
2. Create a new token named `github-actions`.
3. Copy the token — add it to GitHub Secrets as `RAILWAY_TOKEN` (Step 6).

---

## Step 3: Vercel Setup

You will create three Vercel projects, one per frontend app.

### 3.1 Env-var Strategy (Hobby Tier)

> **Shared Env Vars are only available on Vercel Pro+.** Comm-Fit is on Hobby, so each project's environment variables must be configured independently — 7 variables × 3 projects = **21 individual additions**. There are no team-level shared secrets on Hobby.

> **`vercel secrets add` is deprecated** in Vercel CLI v33+ and removed in v54.2.0. Do not use it. Configure env vars via the Dashboard or `vercel env add` instead.

For each project you can use either flow:

**Dashboard flow (recommended for first-time setup):**
1. Open the Vercel Dashboard → select your project → **Settings → Environment Variables**.
2. For each variable listed in 3.2 / 3.3 / 3.4 below, click **Add** and set:
   - **Name:** the variable name (e.g. `NEXT_PUBLIC_API_URL`)
   - **Value:** the actual value (substitute placeholders from your Substitution Table)
   - **Environment:** tick **Production** (and **Preview** if desired)
3. Click **Save**.
4. Redeploy the project for the new vars to take effect.

**CLI flow (alternative):**
```bash
cd apps/<app>
vercel link --project commfit-<app>
# Then for each variable (runs interactively):
vercel env add <NAME> production
```

### 3.2 Create the Ops App

1. Go to https://vercel.com → **Add New → Project**.
2. Import the commfit GitHub repo.
3. Project name: `commfit-ops`.
4. Framework: Next.js.
5. Root directory: **leave as the repo root** (not `apps/ops`).
6. Override Build Command: `pnpm --filter @commfit/ops build`
7. Override Output Directory: `apps/ops/.next`
8. Override Install Command: `pnpm install --no-frozen-lockfile`
9. After the project is created, add the following 7 environment variables for **Production** (using Dashboard or CLI per Section 3.1):

```
NEXT_PUBLIC_SUPABASE_URL      = <SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY = <SUPABASE_ANON_KEY>
NEXT_PUBLIC_API_URL           = <API_URL>
NEXT_PUBLIC_SENTRY_DSN        = <SENTRY_DSN_OPS>
SENTRY_DSN                    = <SENTRY_DSN_OPS>
SENTRY_ORG                    = <your-sentry-org-slug>
SENTRY_AUTH_TOKEN             = <SENTRY_AUTH_TOKEN>
```

> `<SENTRY_DSN_OPS>` and `<SENTRY_AUTH_TOKEN>` are collected in Step 5. Add them to the project after completing Step 5 and before the first production build.

10. Click **Deploy**. Note the project ID from the URL: `https://vercel.com/<org>/<project-name>/settings` → copy the Project ID. Add it to GitHub Secrets as `VERCEL_OPS_PROJECT_ID`.

### 3.3 Create the Tech App

Repeat Step 3.2 for the Tech app:

- Project name: `commfit-tech`
- Build command: `pnpm --filter @commfit/tech build`
- Output directory: `apps/tech/.next`

Add the following 7 environment variables for **Production**:

```
NEXT_PUBLIC_SUPABASE_URL      = <SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY = <SUPABASE_ANON_KEY>
NEXT_PUBLIC_API_URL           = <API_URL>
NEXT_PUBLIC_SENTRY_DSN        = <SENTRY_DSN_TECH>
SENTRY_DSN                    = <SENTRY_DSN_TECH>
SENTRY_ORG                    = <your-sentry-org-slug>
SENTRY_AUTH_TOKEN             = <SENTRY_AUTH_TOKEN>
```

Add `VERCEL_TECH_PROJECT_ID` to GitHub Secrets.

### 3.4 Create the Customer App

Repeat Step 3.2 for the Customer app:

- Project name: `commfit-customer`
- Build command: `pnpm --filter @commfit/customer build`
- Output directory: `apps/customer/.next`

Add the following 7 environment variables for **Production**:

```
NEXT_PUBLIC_SUPABASE_URL      = <SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY = <SUPABASE_ANON_KEY>
NEXT_PUBLIC_API_URL           = <API_URL>
NEXT_PUBLIC_SENTRY_DSN        = <SENTRY_DSN_CUSTOMER>
SENTRY_DSN                    = <SENTRY_DSN_CUSTOMER>
SENTRY_ORG                    = <your-sentry-org-slug>
SENTRY_AUTH_TOKEN             = <SENTRY_AUTH_TOKEN>
```

Add `VERCEL_CUSTOMER_PROJECT_ID` to GitHub Secrets.

### 3.5 Collect Vercel Org ID

```bash
vercel whoami
# Shows your team/org slug
vercel teams ls
# Shows the team ID — add as VERCEL_ORG_ID in GitHub Secrets
```

Add `VERCEL_TOKEN` to GitHub Secrets: go to https://vercel.com/account/tokens → create a token named `github-actions`.

---

## Step 4: (Covered in Step 2 and 3)

Railway and Vercel setup are complete. Continue to Sentry.

---

## Step 5: Sentry Setup

Create five Sentry projects — one per service.

### 5.1 Create Sentry Projects

1. Log in to https://sentry.io.
2. Go to **Settings → Projects → Create Project**.
3. Create the following projects:

| Project Name | Platform |
|---|---|
| `commfit-api` | Node.js |
| `commfit-worker` | Node.js |
| `commfit-ops` | Next.js |
| `commfit-tech` | Next.js |
| `commfit-customer` | Next.js |

4. For each project, copy the **DSN** from Project Settings → Client Keys (DSN).

### 5.2 Create Sentry Auth Token

1. Go to https://sentry.io/settings/account/api/auth-tokens/.
2. Create a new token with scopes: `project:releases`, `org:read`.
3. Copy the token.

### 5.3 Distribute DSNs

Go back and add the DSNs to the services. Record each DSN in your Substitution Table using the `<SENTRY_DSN_*>` placeholder names.

**Railway services (Variables tab for each service):**
- API service: add `SENTRY_DSN = <SENTRY_DSN_API>`
- Worker service: add `SENTRY_DSN = <SENTRY_DSN_WORKER>`

**Vercel apps (Dashboard or CLI per Section 3.1 — per-project, not shared):**
- `commfit-ops`: add/update `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to `<SENTRY_DSN_OPS>`
- `commfit-tech`: add/update `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to `<SENTRY_DSN_TECH>`
- `commfit-customer`: add/update `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to `<SENTRY_DSN_CUSTOMER>`
- Each project: add/update `SENTRY_AUTH_TOKEN` to `<SENTRY_AUTH_TOKEN>`

> If you set up the Vercel projects in Step 3 before completing Step 5, go back to each project's Settings → Environment Variables now and fill in the `SENTRY_DSN` and `SENTRY_AUTH_TOKEN` values.

---

## Step 6: GitHub Actions Setup

### 6.1 Add All GitHub Secrets

Go to the GitHub repo → **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret Name | Value |
|---|---|
| `RAILWAY_TOKEN` | Railway API token from Step 2.6 |
| `VERCEL_TOKEN` | Vercel token from Step 3.5 |
| `VERCEL_ORG_ID` | Vercel team ID from Step 3.5 |
| `VERCEL_OPS_PROJECT_ID` | Vercel project ID for commfit-ops |
| `VERCEL_TECH_PROJECT_ID` | Vercel project ID for commfit-tech |
| `VERCEL_CUSTOMER_PROJECT_ID` | Vercel project ID for commfit-customer |

### 6.2 CI Workflow (Automatic)

The CI workflow (`.github/workflows/ci.yml`) runs automatically on every push and on pull requests to `dev` and `main`. No manual action required.

Verify it is working:

```bash
# Push to a feature branch and check GitHub → Actions tab
git checkout -b feat/test-ci
git commit --allow-empty -m "test: trigger CI"
git push origin feat/test-ci
```

The CI run should complete lint, typecheck, build, and test within ~10 minutes.

### 6.3 First Production Deploy

The CTO merges feature branches into `dev`. When `dev` is ready for a release, the founder merges `dev` into `main`:

```bash
git checkout main
git merge dev
git push origin main
```

This triggers CI on `main`. Once CI passes, trigger the deploy workflow manually:

1. Go to GitHub → **Actions → Deploy → Run workflow**.
2. Select:
   - Environment: `production`
   - Services: `all`
3. Click **Run workflow**.

Monitor the workflow run in the Actions tab. Each job (api, worker, ops, tech, customer) runs in parallel.

---

## Step 7: Smoke Tests

After the first successful deploy, run through each smoke test to confirm end-to-end functionality.

### 7.1 App Load Tests

Verify each app loads without errors:

- [ ] Open `https://commfit-ops.vercel.app` — Ops app loads, no console errors.
- [ ] Open `https://commfit-tech.vercel.app` — Tech app loads, no console errors.
- [ ] Open `https://commfit-customer.vercel.app` — Customer portal loads, no console errors.
- [ ] `curl <API_URL>/v1/health` returns `{"status":"ok"}`.

### 7.2 Login Tests

For each app, log in with the seeded demo credentials:

- [ ] Ops app: log in as the demo Operations Manager user. Confirm dashboard loads.
- [ ] Tech app: log in as the demo Technician user. Confirm job list loads.
- [ ] Customer portal: log in as the demo Customer user. Confirm account overview loads.

### 7.3 Demo Flow: PM Visit (Service Visit)

1. In the Ops app, create a new preventive maintenance visit for the demo site.
2. Assign it to the demo Technician.
3. In the Tech app, log in as the Technician and confirm the visit appears in the job list.
4. Mark the visit as complete.
5. In the Ops app, confirm the visit status is updated.

### 7.4 Demo Flow: SR Ticket (Service Request)

1. In the Customer portal, submit a new service request.
2. In the Ops app, confirm the SR appears in the queue.
3. Assign the SR to a Technician.
4. In the Tech app, resolve the SR.
5. In the Ops app, confirm the SR status is resolved.

### 7.5 Demo Flow: Quote

1. In the Ops app, create a quote for the demo customer.
2. Add line items.
3. Send the quote to the customer (email mock or in-app notification).
4. In the Customer portal, confirm the quote is visible.
5. Accept the quote.
6. In the Ops app, confirm the quote status changes to accepted.

### 7.6 Demo Flow: Invoice

1. In the Ops app, convert the accepted quote to an invoice.
2. Confirm the invoice appears in the customer portal.
3. Simulate payment (Stripe mock in dev, real Stripe in production staging).
4. Confirm payment status updates in both portals.

### 7.7 Demo Flow: Sign-Off

1. In the Tech app, complete a job and trigger the customer sign-off flow.
2. In the Customer portal, sign off the completed job (DocuSign mock or real DocuSign).
3. In the Ops app, confirm the job shows a completed/signed status with the timestamp.

---

## Troubleshooting

### Build fails: `pnpm install --no-frozen-lockfile` times out

- Check Railway/Vercel build logs for the specific package causing the timeout.
- Try increasing the build timeout in the Railway service settings.

### API returns 500 on `/v1/health`

- Check Railway logs for startup errors.
- Confirm `DATABASE_URL` is set correctly and the Supabase instance is accessible.
- Confirm `REDIS_URL` is set and the Railway Redis instance is running.

### Vercel deploy fails: missing environment variable

- `vercel.*.json` files no longer carry an `env` block — env vars are configured per-project in the Vercel Dashboard or via `vercel env add`. If a build fails due to a missing variable, go to Dashboard → Project → Settings → Environment Variables and verify all 7 vars from Section 3.2 / 3.3 / 3.4 are present and set to non-empty values for the Production environment.
- If you see a reference to an `@commfit-*` secret in an old build log, that run was triggered before this fix was merged. Trigger a new deployment after the env vars are set.

### Sentry errors not appearing

- Confirm `SENTRY_DSN` is set for the service.
- Check that `SENTRY_AUTH_TOKEN` has the correct scopes (`project:releases`, `org:read`).
- In local dev, Sentry is disabled unless `SENTRY_DSN` is explicitly set in `.env.local`.

### Railway deploy: `railway up` command not found

- The deploy workflow installs `@railway/cli` via npm. If this fails, check the npm registry connectivity in the GitHub Actions runner.
- As a fallback, use `npx @railway/cli up --service api --detach`.
