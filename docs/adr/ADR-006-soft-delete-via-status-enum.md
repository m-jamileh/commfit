# ADR-006: Soft Delete via Status Enum (No Hard Deletes on Entity Tables)

**Status**: Accepted
**Date**: 2026-05-20
**Deciders**: Principal Architect

---

## Context

Entity tables (Account, Location, Equipment, Technician, Job, Quote, Contract, Invoice, Payment, Part, etc.) are referenced by foreign keys throughout the schema. Hard-deleting a row can:

1. Violate referential integrity if any FK is not marked `ON DELETE CASCADE` or `ON DELETE SET NULL`.
2. Permanently lose audit history: what jobs did this technician complete? What invoices existed for this account?
3. Make data recovery after accidental deletion impossible without a point-in-time DB restore.
4. Conflict with regulatory requirements (financial records must be retained for 7 years in many jurisdictions).

---

## Decision

Entity tables use a `status` column typed as a `GenericStatus` enum with values `active` and `archived`. "Deleting" a record means setting `status = 'archived'`. No `DELETE` SQL statements are ever issued against entity tables.

The schema enforces this by:
- Including `status GenericStatus @default(active)` on all entity tables.
- Adding `@@index([status])` on all entity tables to keep filtered queries fast.

API endpoints that conceptually "delete" a resource (e.g. `DELETE /accounts/:id`) actually perform a status update: `{ status: 'archived' }`.

---

## Rationale

### Audit Compliance

Field-service businesses are subject to invoicing, warranty, and labor regulations that require retention of service records. Soft delete ensures records are never permanently lost within the application layer. Physical deletion, if ever required (GDPR erasure), can be performed via a controlled data-retention job, not ad-hoc API calls.

### FK Integrity

Hard deletes on parent rows (Account, Location, Equipment) would require cascading to all child rows (Jobs, Invoices, CommissionEarnings) or setting FKs to null. Soft delete avoids cascade complexity. Child rows remain intact and continue to reference their parent, preserving the full service history.

### Ability to Restore

An archived account, technician, or equipment record can be restored (`status → active`) without data loss. This is important in practice: equipment that was archived by mistake, or a technician who was temporarily offboarded, can be reactivated without re-entering data.

### Behavioral Clarity

All list queries on entity tables must include a `status = 'active'` filter by default. Archived records appear only in admin views that explicitly opt in to `status = 'archived'` or `status IN ('active', 'archived')`. This must be established as a code review rule: any repository query on an entity table without a `status` filter is a bug.

---

## Consequences

### All Queries Must Filter by Status

This is the primary operational burden. Forgetting `status = 'active'` in a query will return archived records to end users. Mitigation strategies:
- The `ScopedRepository.scopedWhere()` helper can be extended in M2 to include `status: 'active'` as a default filter parameter that callers can override.
- Code review checklist includes: "Does this query filter by status?"

### Append-Only Tables Are Exempt

`AuditLog`, `EmailInbox`, `ErpSyncLog`, `CrmSyncLog` are append-only tables. They have no `status` column and no `updatedAt`. Their contents are never modified or archived, only accumulated.

### Hard Deletes for Non-Entity Tables

`IdempotencyRecord` rows expire and can be hard-deleted by a maintenance job after `expiresAt` has passed. This is not an entity table (no business meaning beyond deduplication) and is explicitly exempt from the soft-delete policy.

### Cascade Archiving

When an Account is archived, its child Locations and Equipment are not automatically archived by the database. Application-level logic (M3) is responsible for propagating the archive status to children when appropriate. The schema's FK references remain intact regardless.
