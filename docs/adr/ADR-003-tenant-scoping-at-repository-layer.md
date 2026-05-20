# ADR-003: Tenant Scoping Enforced at Repository Layer

**Status**: Accepted
**Date**: 2026-05-20
**Deciders**: Principal Architect

---

## Context

Comm-Fit Service is a multi-tenant platform. Each `Account` is a distinct tenant. Data belonging to one account must never be readable or writable by users of another account. This is a hard security requirement.

Two common approaches to enforce tenant isolation are:

1. **Middleware-only scoping**: Middleware extracts the `accountId` from the JWT and attaches it to the request. Controllers pass it to services. The developer must manually include the `accountId` filter in every query.
2. **Repository-layer scoping**: A base repository class owns the `accountId` filter and applies it automatically. Feature services call the repository, which enforces the scope.

---

## Decision

Tenant scoping is enforced at the repository base class (`ScopedRepository`), not only at middleware. The middleware (`ScopeMiddleware`) is still used to resolve the `accountId` from the JWT and attach it to `req.tenantScope`, but it is **not** the enforcement point.

The `ScopedRepository` abstract class in `apps/api/src/database/scoped.repository.ts` provides:

```typescript
protected scopedWhere<T extends Record<string, unknown>>(
  accountId: string,
  extra?: T,
  locationId?: string,
): WithScope<T>
```

All concrete repository classes must extend `ScopedRepository` and must use `scopedWhere()` when building Prisma `where` clauses for tenant-scoped tables. The TypeScript type `WithScope<T>` ensures `accountId` is always present in the where clause.

---

## Rationale

### Defense in Depth

Middleware runs per-request and can be bypassed in multiple ways:
- Internal service-to-service calls (e.g. a BullMQ processor calling a service method directly) may not have a request context.
- A developer adding a new endpoint may forget to call `requireTenantScope()`.
- Integration tests or admin scripts may call services directly.

The repository layer is the last line of defense before a SQL query is executed. If `scopedWhere()` is always called there, tenant isolation cannot be bypassed regardless of how the service is invoked.

### TypeScript Enforcement at Query-Build Time

By making `scopedWhere()` return a `WithScope<T>` type that requires `accountId`, the TypeScript compiler catches any query that omits the tenant filter at compile time. This is not possible with middleware-only scoping, where the developer might pass an empty `where` clause.

### Testability

Feature services can be tested in isolation by passing a test `accountId` directly to repository methods, without needing to mock the request/middleware stack.

---

## Consequences

### Requirements Imposed on All Repositories

- Every repository that touches a tenant-scoped table (Account, Location, Equipment, Job, Quote, Contract, Invoice, Payment, etc.) **must** extend `ScopedRepository`.
- Every repository method that queries a tenant-scoped table **must** call `scopedWhere()` to build the `where` clause.
- Global (non-tenant-scoped) tables (AuditLog, Part, CommissionRule) may use raw Prisma queries without `scopedWhere()`, but this must be a conscious decision documented in the repository class.

### Code Review Checklist

PR reviewers must verify:
1. Any new repository method on a tenant-scoped table calls `scopedWhere()`.
2. The `accountId` parameter is not hardcoded (it must come from the `ScopedFilter` passed by the controller/service layer from `req.tenantScope`).

### Not Affected

- The middleware (`ScopeMiddleware`) remains required for the request path to populate `req.tenantScope`. It is the source of the `accountId` value that flows into repository calls.
- Admin endpoints that intentionally cross account boundaries (e.g. internal reporting) must explicitly opt out of scoping by not using `ScopedRepository` and documenting the reason.
