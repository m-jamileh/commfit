# ADR-008 — Job Photo Storage via Supabase Storage (M4.1)

**Status:** Accepted (M4.1 — founder decision, COM-42 / COM-47)
**Date:** 2026-05-21
**Supersedes:** earlier base64-inline draft (never merged)

## Context

The tech app needs to upload job photos from mobile devices in M4.1. Two options were evaluated:

1. **Base64 inline** — client POSTs a `data:image/...;base64,...` body to `POST /v1/jobs/:id/photos`; API stores the string in `job_photo.url`.
2. **Supabase Storage direct upload** — client uploads the file directly to a private Supabase Storage bucket, then POSTs only the resulting URL to `POST /v1/jobs/:id/photos`.

Founder decision (COM-42#comment-a5ed5009, restated on COM-47#comment-b74684f2) chose option 2.

## Decision

- Bucket `job-photos` (private) provisioned in Supabase Storage.
- Path convention: `<accountId>/<jobId>/<photoId>.<ext>` for RLS prefix scoping.
- Frontend tech app uploads the file directly to Supabase Storage using the user's JWT.
- API server receives and persists only the Supabase Storage URL string.
- **No `@supabase/supabase-js` import inside `apps/api/**`** — the API never signs, proxies, or validates Storage URLs in M4.1.
- RLS policies live in `packages/db/migrations/storage/job-photos-policy.sql`; apply steps are in `infra/deploy-runbook.md § 1.5`.

## Trade-offs

- **Pro:** No bytes transit the API server; no body-size cap needed on the route; `@supabase/supabase-js` is an existing dependency (no new SDK).
- **Pro:** Clean separation — Storage handles auth, CDN, and bandwidth; API handles only metadata.
- **Con:** Requires the JWT `account_id` claim to be populated for RLS to work; if the claim is absent, uploads fail silently with 403.
- **Con:** API cannot validate that the URL points to a real object in the correct bucket; a client could persist an arbitrary URL.

## Consequences

- `job_photo.url` contains a Supabase Storage URL of the form `https://<project>.supabase.co/storage/v1/object/sign/job-photos/<accountId>/<jobId>/<photoId>.<ext>?token=...`.
- API-server-mediated uploads and signed URL generation are deferred to M5 if needed.
