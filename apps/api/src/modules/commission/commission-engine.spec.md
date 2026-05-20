# Commission Engine Specification

## 1. Overview

The commission engine computes technician commission earnings whenever an invoice is finalized (transitions to `paid` or `sent` status). It reads all `CommissionRule` records, evaluates them in priority order against the technician and invoice line item context, and persists `CommissionEarning` rows. Every computation is traceable via a `rule_trace` JSON field. The engine supports a default fallback of 0% when no rule matches, and a bonus tier when a technician exceeds a monthly job threshold.

The engine is deliberately deterministic and re-entrant: running it twice on the same invoice (e.g. after a rule update) must produce consistent results. Idempotency is enforced by checking for existing `CommissionEarning` rows keyed on `(technicianId, invoiceId, invoiceLineItemId)` before inserting.

---

## 2. Data Model

### CommissionRule

| Field                  | Type            | Semantics                                                                                                    |
|------------------------|-----------------|--------------------------------------------------------------------------------------------------------------|
| `id`                   | UUID            | Primary key                                                                                                  |
| `name`                 | String          | Human-readable label shown in the admin UI                                                                   |
| `description`          | String?         | Optional long-form explanation                                                                               |
| `techTypeFilter`       | TechType?       | `in_house` or `third_party`. `null` matches any tech type.                                                   |
| `jobTypeFilter`        | JobType?        | `pm`, `sr`, `disinfecting`, `install`. `null` matches any job type.                                          |
| `equipmentClassFilter` | EquipmentClass? | `cardio`, `strength`, `flooring`, `functional`, `other`. `null` matches any equipment class.                 |
| `technicianIdFilter`   | UUID?           | Exact technician UUID. `null` matches any technician (acts as a wildcard).                                   |
| `ratePct`              | Decimal(5,2)    | Base commission rate applied to the invoice line item's `totalCents`. E.g. `8.50` = 8.50%.                  |
| `bonusThresholdJobs`   | Int?            | If set, the bonus tier activates when the technician completed >= this many jobs in the current calendar month. |
| `bonusRatePct`         | Decimal(5,2)?   | The rate applied instead of `ratePct` when the bonus threshold is met. Required if `bonusThresholdJobs` is set. |
| `priority`             | Int             | Lower number = higher priority. Evaluation order is ascending by `priority`, then by `createdAt` ASC as tiebreaker. |
| `active`               | Boolean         | Inactive rules are excluded from evaluation entirely.                                                        |
| `metadata`             | Json            | Arbitrary key-value pairs for admin notes, cost-center codes, etc.                                           |

### CommissionEarning

| Field                | Type              | Semantics                                                                                        |
|----------------------|-------------------|--------------------------------------------------------------------------------------------------|
| `id`                 | UUID              | Primary key                                                                                      |
| `technicianId`       | UUID (FK)         | The technician who earned the commission                                                         |
| `invoiceId`          | UUID (FK)         | The invoice that triggered computation                                                           |
| `invoiceLineItemId`  | UUID? (FK)        | The specific line item this earning relates to (`null` for invoice-level earnings)               |
| `commissionRuleId`   | UUID? (FK)        | The rule that fired (`null` if the fallback 0% default was used)                                 |
| `jobId`              | UUID? (FK)        | The job associated with this invoice (convenience denormalization for reports)                   |
| `baseAmountCents`    | BigInt            | The line item's `totalCents` used as the base for commission calculation                         |
| `commissionPct`      | Decimal(5,2)      | The actual rate applied (either `ratePct` or `bonusRatePct`)                                     |
| `commissionCents`    | BigInt            | `floor(baseAmountCents * commissionPct / 100)` — rounded down to avoid fractional cents          |
| `ruleTrace`          | Json              | Structured record of evaluation (see §6)                                                         |
| `status`             | CommissionStatus  | `pending` → `approved` → `paid`                                                                  |
| `paidAt`             | Timestamptz?      | Set when status transitions to `paid`                                                            |
| `metadata`           | Json              | Arbitrary key-value pairs                                                                        |

---

## 3. Rule Evaluation Algorithm

### 3.1 Load Phase

1. Fetch all `CommissionRule` rows where `active = true`.
2. Sort ascending by `priority ASC, createdAt ASC` (lower priority number wins; earliest-created wins ties).

### 3.2 Context Assembly

For each `CommissionEarning` candidate (one per `(technician, invoiceLineItem)` pair):

- `techType`: from `Technician.techType`
- `jobType`: from `Job.jobType` (the job linked to the invoice)
- `equipmentClass`: from `Equipment.equipmentClass` of the equipment referenced by `InvoiceLineItem.jobEquipmentId` (if present; otherwise `null`)
- `technicianId`: from `Technician.id`

### 3.3 Filter Matching

A rule **matches** a context when ALL of the following are true:

| Filter field           | Match condition                                          |
|------------------------|----------------------------------------------------------|
| `techTypeFilter`       | `null` OR equals context `techType`                      |
| `jobTypeFilter`        | `null` OR equals context `jobType`                       |
| `equipmentClassFilter` | `null` OR equals context `equipmentClass`                |
| `technicianIdFilter`   | `null` OR equals context `technicianId`                  |

### 3.4 First-Match Semantics

Iterate the sorted rule list. The **first** rule that matches is used. No further rules are evaluated. This is intentional: admin must order rules carefully, with most-specific rules at lower priority numbers (evaluated first).

### 3.5 No-Match Fallback

If no rule matches the context:
- `commissionRuleId` is set to `null`
- `commissionPct` is `0.00`
- `commissionCents` is `0`
- A `WARN` log is emitted: `"No commission rule matched for technician={id} job={id} lineItem={id} — applying 0% fallback"`
- The `rule_trace` records `matched: false, fallback: true`

---

## 4. Bonus Tier Calculation

When the matched rule has `bonusThresholdJobs` set:

1. Count the number of jobs with `status = completed` for this technician in the current **calendar month** (UTC): `completedAt >= first_day_of_month AND completedAt < first_day_of_next_month`.
2. If `completedJobsThisMonth >= bonusThresholdJobs`:
   - Apply `bonusRatePct` instead of `ratePct`.
   - Record `bonusTierActivated: true` in `rule_trace`.
3. Otherwise apply `ratePct`.
   - Record `bonusTierActivated: false` in `rule_trace`.

The job count query is a single indexed read (`technicianId`, `status`, `completedAt`) and must be performed **per technician per rule evaluation**, not cached across technicians, to ensure correctness.

---

## 5. Computation Trigger

### Event Flow

```
Invoice finalized (status → paid | sent)
  └─▶ Dispatch BullMQ job: queue = "commission-recompute"
        payload: { invoiceId, triggeredByUserId? }
  └─▶ Processor: commission-recompute.processor.ts
        1. Load Invoice + InvoiceLineItems + Job + Technician
        2. For each InvoiceLineItem × Technician assigned to job:
             a. Assemble context (techType, jobType, equipmentClass, technicianId)
             b. Run rule engine → (matchedRule | fallback)
             c. Apply bonus tier check
             d. Upsert CommissionEarning (check for existing by composite key)
             e. Write AuditLog row
        3. On processor error: BullMQ retries up to 3× with exponential backoff
```

### Idempotency Key

Before inserting a `CommissionEarning`, query:

```sql
SELECT id FROM commission_earnings
WHERE technician_id = $1
  AND invoice_id = $2
  AND COALESCE(invoice_line_item_id::text, '') = COALESCE($3::text, '')
```

If a row exists, skip insertion (log `WARN: commission earning already exists, skipping`). This makes the processor safe to retry.

---

## 6. Output: rule_trace JSON Structure

The `rule_trace` field is a JSON object persisted on every `CommissionEarning`. It provides a full audit trail without requiring a JOIN:

```json
{
  "evaluatedAt": "2026-05-20T10:30:00.000Z",
  "invoiceId": "uuid",
  "invoiceLineItemId": "uuid | null",
  "technicianId": "uuid",
  "context": {
    "techType": "in_house",
    "jobType": "pm",
    "equipmentClass": "cardio",
    "technicianId": "uuid"
  },
  "rulesEvaluated": [
    {
      "ruleId": "uuid",
      "ruleName": "In-House PM Cardio",
      "priority": 10,
      "filters": {
        "techTypeFilter": "in_house",
        "jobTypeFilter": "pm",
        "equipmentClassFilter": "cardio",
        "technicianIdFilter": null
      },
      "matched": true
    }
  ],
  "matchedRuleId": "uuid | null",
  "matched": true,
  "fallback": false,
  "bonusTierActivated": false,
  "bonusThresholdJobs": 20,
  "completedJobsThisMonth": 12,
  "rateApplied": 8.50,
  "baseAmountCents": 25000,
  "commissionCents": 2125
}
```

When no rule matches:

```json
{
  "matched": false,
  "fallback": true,
  "matchedRuleId": null,
  "rateApplied": 0.00,
  "commissionCents": 0,
  "rulesEvaluated": [ /* all rules tried */ ]
}
```

---

## 7. Admin Preview Endpoint

`POST /v1/commission/compute-preview`

**Purpose**: Allows admins to dry-run the commission engine against a sample invoice payload without persisting any `CommissionEarning` rows or audit logs.

**Request body**:
```json
{
  "invoiceId": "uuid",
  "technicianId": "uuid"
}
```

**Response**:
```json
{
  "preview": [
    {
      "invoiceLineItemId": "uuid",
      "baseAmountCents": 25000,
      "commissionPct": 8.50,
      "commissionCents": 2125,
      "ruleTrace": { /* full trace object */ }
    }
  ],
  "totalCommissionCents": 2125,
  "wouldPersist": false
}
```

The endpoint runs the engine in read-only mode: all DB reads are performed normally, but no writes occur. The response includes the full `ruleTrace` for every line item.

---

## 8. Audit Requirement

Every `CommissionEarning` creation (not update) MUST produce a corresponding `AuditLog` row:

| Field        | Value                                     |
|--------------|-------------------------------------------|
| `actorUserId`| `triggeredByUserId` from BullMQ payload (nullable) |
| `entityType` | `"CommissionEarning"`                     |
| `entityId`   | The new `CommissionEarning.id`            |
| `action`     | `"create"`                                |
| `before`     | `null`                                    |
| `after`      | Serialized `CommissionEarning` fields     |

The audit write must happen within the same Prisma transaction as the `CommissionEarning` insert to guarantee consistency.

---

## 9. Edge Cases

### 9.1 No Matching Rule → Default 0%

When no active rule matches a context, the engine applies a 0% rate. This results in a `CommissionEarning` row with `commissionCents = 0`, `commissionRuleId = null`, and `fallback = true` in the trace. A `WARN` log is emitted with the full context to allow admin diagnosis.

**Why persist a $0 earning?** To make the audit trail complete. If an admin later creates a matching rule and reruns the engine (via a future recompute endpoint), the existing $0 earning is skipped due to the idempotency check.

### 9.2 Multiple Technicians on One Invoice Line Item

When multiple technicians are assigned to a single job (future feature; currently one technician per job), the engine creates **one `CommissionEarning` row per technician per line item**. Each earning is independent and uses the same base amount (`lineItem.totalCents`), not a split.

### 9.3 Invoice with No Job

An invoice may have no associated job (e.g. a manual invoice). In this case:
- `jobType` context is `null`
- Only rules with `jobTypeFilter = null` can match
- `equipmentClass` context is `null`
- `jobId` on `CommissionEarning` is `null`

### 9.4 Concurrent Recompute Jobs

BullMQ may deliver two recompute jobs for the same invoice simultaneously (e.g. rapid double-publish). The idempotency check (`SELECT` before `INSERT`) is performed inside a Prisma transaction with a unique constraint on `(technicianId, invoiceId, invoiceLineItemId)`. One job will succeed; the other will receive a unique constraint error and skip without erroring the BullMQ job.

---

## 10. Example Rule Configurations and Expected Outputs

### Example A: Tiered In-House PM Rate with Bonus

**Rules (in priority order):**

| Priority | Name                    | techTypeFilter | jobTypeFilter | equipmentClassFilter | technicianIdFilter | ratePct | bonusThresholdJobs | bonusRatePct |
|----------|-------------------------|----------------|---------------|----------------------|--------------------|---------|--------------------|--------------|
| 10       | In-House PM Cardio      | in_house       | pm            | cardio               | null               | 8.50    | 20                 | 10.00        |
| 20       | In-House PM Any         | in_house       | pm            | null                 | null               | 7.00    | null               | null         |
| 100      | Third-Party All         | third_party    | null          | null                 | null               | 5.00    | null               | null         |
| 999      | Default Catch-All       | null           | null          | null                 | null               | 3.00    | null               | null         |

**Scenario A1**: Tech=in_house, job=pm, equipment=cardio, 15 completed jobs this month
- Rule 10 matches (first match): `techTypeFilter=in_house` ✓, `jobTypeFilter=pm` ✓, `equipmentClassFilter=cardio` ✓
- bonusThresholdJobs=20, completedJobsThisMonth=15 → bonus NOT activated
- Rate applied: 8.50%
- Base: $250.00 (25,000 cents) → Commission: $21.25 (2,125 cents)

**Scenario A2**: Same tech, same job, 22 completed jobs this month
- Rule 10 matches: bonus threshold met (22 >= 20)
- Rate applied: 10.00% (bonusRatePct)
- Base: $250.00 → Commission: $25.00 (2,500 cents)

**Scenario A3**: Tech=in_house, job=pm, equipment=strength
- Rule 10: `equipmentClassFilter=cardio` — does NOT match strength
- Rule 20: `techTypeFilter=in_house` ✓, `jobTypeFilter=pm` ✓, `equipmentClassFilter=null` ✓ → MATCH
- Rate applied: 7.00%
- Base: $250.00 → Commission: $17.50 (1,750 cents)

**Scenario A4**: Tech=third_party, job=sr, equipment=flooring
- Rule 10: techType mismatch
- Rule 20: techType mismatch
- Rule 100: `techTypeFilter=third_party` ✓, `jobTypeFilter=null` ✓, `equipmentClassFilter=null` ✓ → MATCH
- Rate applied: 5.00%
- Base: $300.00 → Commission: $15.00 (1,500 cents)

### Example B: Technician-Specific Override

**Rule**: priority=5, `technicianIdFilter=abc-123-uuid`, ratePct=12.00, all other filters null

This rule fires only for technician `abc-123-uuid`, regardless of job type or equipment. Because priority=5 < all other rules, it is evaluated first and wins for this specific technician. All other technicians skip it (filter fails) and fall through to lower-priority rules.

**Expected output for technician abc-123-uuid**: 12.00% on every line item.
**Expected output for any other technician**: Evaluated by remaining rules starting at priority 10+.
