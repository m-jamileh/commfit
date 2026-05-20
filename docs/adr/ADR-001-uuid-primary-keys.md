# ADR-001: UUID Primary Keys

**Status**: Accepted
**Date**: 2026-05-20
**Deciders**: Principal Architect

---

## Context

Comm-Fit Service is a multi-tenant platform whose data will eventually be distributed across read replicas, exported to partner systems (ERP, CRM), and referenced from external documents (DocuSign envelopes, Stripe charge IDs). Primary key design affects security, interoperability, and future sharding potential.

The two common choices are:

1. **Serial integer PKs** (`SERIAL` / `BIGSERIAL` in PostgreSQL): auto-incrementing, compact, sequential.
2. **UUID PKs** (`uuid` type, generated via `gen_random_uuid()`): globally unique, non-sequential, 128-bit.

---

## Decision

All entity tables use UUID version 4 primary keys generated at the database layer using PostgreSQL's built-in `gen_random_uuid()` function (available without extensions from PostgreSQL 13+).

In Prisma this is expressed as:

```prisma
id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
```

---

## Rationale

### Security

Sequential integer PKs expose internal record counts to external parties. A customer who receives invoice `#1042` can infer that roughly 1,041 other invoices exist. For a B2B platform, this leaks competitive intelligence (how busy the platform is) and enables enumeration attacks (guessing valid IDs). UUIDs are non-guessable and non-enumerable.

### Distributed-System Safety

UUID generation does not require a round-trip to a central sequence generator. When data is later exported to analytics databases, data warehouses, or partner APIs, UUID PKs remain globally unique without collision risk. Serial integers require a remapping step when merging data from multiple sources.

### Prisma and PostgreSQL Support

Prisma natively supports `@db.Uuid` and `gen_random_uuid()`. The Prisma client generates correct UUID-typed parameters. PostgreSQL stores UUIDs efficiently as 16 bytes internally.

### External Reference Stability

IDs appear in DocuSign envelope metadata, Stripe charge descriptions, and BullMQ job payloads. UUIDs make these references stable and opaque.

---

## Consequences

### Accepted Tradeoffs

- **Index size**: UUID indexes are larger than integer indexes (16 bytes vs 4–8 bytes per entry). For tables expected to have tens of millions of rows (AuditLog, CommissionEarning), this increases storage and index maintenance overhead. This is deemed acceptable given the security and distribution benefits.
- **Random UUID fragmentation**: UUID v4 values are random, which causes B-tree index fragmentation over time. Mitigation: consider UUID v7 (timestamp-ordered) for high-write tables in a future ADR if VACUUM overhead becomes measurable.
- **Human readability**: UUIDs are less readable than short integers in logs and support tickets. Mitigation: expose a separate `invoiceNumber` (human-readable sequential ID) on the Invoice table for customer-facing communication.

### Not Affected

- Application-level ID generation is not used. The database always assigns the ID. This prevents mismatches between application-generated IDs and database-stored values.
- Foreign keys remain typed as `@db.Uuid` with proper Prisma `@relation` mappings, ensuring referential integrity is enforced at the database layer.
