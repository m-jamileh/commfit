# ADR-004: BullMQ Queue Topology

**Status**: Accepted
**Date**: 2026-05-20
**Deciders**: Principal Architect

---

## Context

Comm-Fit Service has several workloads that must not block the request/response cycle:

- **Email delivery**: Sending transactional emails should be decoupled from the request that triggers them.
- **PM rollover**: Scheduled maintenance jobs must be generated on a cadence without a user request.
- **Autopay simulation**: Recurring contract payments must be charged without manual intervention.
- **Commission recompute**: Computing commissions after invoice finalization can be slow (multiple DB reads) and must not block the invoice finalization response.
- **Async audit logging**: High-volume audit events should be written asynchronously to avoid adding latency to critical write paths.

---

## Decision

The worker app (`apps/worker`) uses BullMQ backed by Redis for all async job processing. The queue topology is:

### Queue Names (defined in `apps/worker/src/queues.ts`)

| Constant                               | Queue Name                        | Purpose                                           |
|----------------------------------------|-----------------------------------|---------------------------------------------------|
| `QUEUE_NAMES.EMAIL_DISPATCH`           | `email-dispatch`                  | Outbound transactional email delivery             |
| `QUEUE_NAMES.SCHEDULED_PM_ROLLOVER`   | `scheduled-pm-rollover`           | Periodic maintenance job generation per contract  |
| `QUEUE_NAMES.RECURRING_AUTOPAY_SIMULATION` | `recurring-autopay-simulation` | Recurring contract payment collection             |
| `QUEUE_NAMES.COMMISSION_RECOMPUTE`    | `commission-recompute`            | Commission engine triggered by invoice finalization |
| `QUEUE_NAMES.AUDIT_ASYNC`             | `audit-async`                     | Non-blocking audit log writes                     |

### One Processor Per Queue

Each queue has exactly one processor function in `apps/worker/src/processors/`. The processor file path is declared in `PROCESSOR_PATHS` in `queues.ts`. This keeps the topology self-documenting.

### Dead-Letter Queue (DLQ) Convention

Failed jobs (exhausted retries) are moved to a Redis key named `<queue-name>:dlq` using the `DLQ_SUFFIX` constant. The `toDlqName()` helper in `queues.ts` constructs the DLQ key name. This follows BullMQ's native failed-job semantics; no separate DLQ queue is created, which avoids queue proliferation.

### Retry Policy

Each queue is configured with:
- **Max attempts**: 3
- **Backoff**: exponential, starting at 1 second
- **Remove on complete**: after 24 hours (to avoid Redis memory bloat)
- **Remove on fail**: retain indefinitely (for operator inspection)

### Idempotency

Job payloads include all data needed to execute the job without a subsequent round-trip to the API layer. Where idempotency is critical (e.g. `recurring-autopay-simulation`), the payload includes an `idempotencyKey` that the processor passes to the payment provider and to the Prisma `IdempotencyRecord` table.

---

## Rationale

### Single Source of Truth for Queue Names

The `QUEUE_NAMES` constant object in `queues.ts` is the single source of truth. All producers (API controllers/services) and consumers (worker processors) import from this file. String literals are never used directly. This prevents typos causing jobs to be published to a queue no processor listens to.

### BullMQ + Redis Matches Production Shape

BullMQ is a mature, production-ready queue backed by Redis. Its job lifecycle (waiting → active → completed/failed), delayed jobs, and repeatable job support cover all five use cases. The Redis connection is already required for session management, so no additional infrastructure is introduced.

### Five Queues Avoids Coupling

Separating queues by domain (email, PM, payment, commission, audit) allows:
- Independent scaling of consumers per queue type
- Different retry policies per queue (e.g. audit can retry aggressively; payment must be idempotent)
- Operator visibility into queue depths per workload type

---

## Consequences

### Operational Requirements

- Redis must be available in all environments (local dev, staging, production).
- Queue names must not be changed without migrating any in-flight jobs, as BullMQ jobs are stored in Redis keyed by queue name.
- The worker app must be deployed alongside the API app. Both read from the same Redis instance.

### Developer Conventions

- When adding a new async workload, first add the queue name to `QUEUE_NAMES` and the payload type to `QueuePayloadMap` in `queues.ts`, then create the processor file. This order ensures the `PROCESSOR_PATHS` map is always consistent with the actual processor files.
- Never use `Queue` or `Worker` constructors with string literals for queue names. Always use `QUEUE_NAMES.<constant>`.

### Not Affected

- Cron-scheduled jobs (e.g. monthly PM rollover trigger) are managed outside BullMQ at M1 (via a cron service or external scheduler). BullMQ's repeatable job feature may be adopted in M3.
