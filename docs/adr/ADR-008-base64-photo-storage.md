# ADR-008 — Base64 Photo Storage (Hotfix Path)

**Status:** Accepted (M4.1 hotfix)
**Date:** 2026-05-21

## Context

The tech app needs to upload job photos from mobile devices during M4.1. Integrating Supabase Storage or any blob-storage SDK was descoped from M4.1 to keep the hotfix surface small and avoid introducing new external dependencies.

## Decision

Accept base64 data-URLs (`data:image/jpeg;base64,...`) directly on `POST /v1/jobs/:id/photos`. The URL string is stored verbatim in `job_photo.url` (Postgres `text` column). A 5 MB request body limit is enforced via the express JSON body parser to prevent oversized payloads.

## Trade-offs

- **Pro:** Zero new SDK dependencies; no credentials or bucket setup required; works immediately.
- **Con:** Base64 inflates image size by ~33 %; large images are stored in the main Postgres database rather than object storage; not suitable for production-scale photo volumes.
- **Limits:** The 5 MB cap (enforced globally) means images must be ≤ ~3.75 MB raw before base64 encoding.

## Consequences

- `job_photo.url` may contain either an HTTPS URL or a base64 data-URL; consumers must handle both forms.
- Supabase Storage integration is planned for M5. At that point, existing rows with data-URL values will need a backfill migration to move blobs into Storage and replace the `url` column with a storage path.
