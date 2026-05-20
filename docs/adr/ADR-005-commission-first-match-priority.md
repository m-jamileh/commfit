# ADR-005: Commission Engine — First-Match Priority Semantics

**Status**: Accepted
**Date**: 2026-05-20
**Deciders**: Principal Architect

---

## Context

The commission engine must evaluate a set of `CommissionRule` rows against a context (technician type, job type, equipment class, technician ID) and determine the applicable rate. The two main evaluation semantics are:

1. **First-match**: Sort rules by priority. Return the rate from the first matching rule. Stop evaluating.
2. **Accumulation**: Evaluate all matching rules. Sum or compose their rates in some way (e.g. additive, max, weighted).

---

## Decision

The commission engine uses **first-match semantics** with ascending priority order (lower number = higher priority). Accumulation is explicitly rejected.

Rules are evaluated in order: `priority ASC, createdAt ASC`. The first rule whose filters all match the context is applied. No subsequent rules are evaluated.

A default fallback of 0% is applied when no rule matches. This is explicit (a `CommissionEarning` row with `commissionRuleId = null` and `fallback = true` is still created) to maintain a complete audit trail.

---

## Rationale

### Simpler Mental Model for Admins

First-match is easy to reason about: "the most specific rule wins." An admin setting up rules can understand the outcome by tracing the rule list in priority order and finding the first match. Accumulation requires understanding all matching rules and their combined effect, which is error-prone.

### Debuggability via rule_trace

The `rule_trace` JSON field records every rule evaluated (in order) before a match was found, including which filters matched or failed. This makes debugging a commission dispute straightforward: the admin can see exactly which rule fired and why earlier rules did not match. Accumulation would require the trace to list every contributing rule and its contribution — much harder to explain to a technician.

### Predictability Under Rule Changes

With first-match semantics, adding a new high-priority rule affects only the contexts it matches, without changing the outcome for contexts it does not match. With accumulation, adding a new matching rule changes the rate for all contexts it matches, potentially in unexpected ways (e.g. a "catch-all" rule at priority 999 would add its rate to every earning).

### Consistent with Industry Practice

Most commission and pricing rule systems (e.g. Stripe's pricing rules, Salesforce CPQ) use first-match or "best match" semantics for exactly this reason.

---

## Consequences

### Admin Must Order Rules Carefully

The admin interface must clearly communicate priority order and provide a way to reorder rules (e.g. drag-to-reorder). A rule at priority 10 that is too broad will shadow more specific rules at priority 20+. The `commission-engine.spec.md` documents example configurations showing how to use ordering correctly.

### No Stacking Commissions

A technician cannot receive multiple commission rates for the same line item. This is a deliberate design choice. If multiple stakeholders need a share of a commission, they should be modeled as separate technician assignments, not as stacked rules.

### Default Fallback Required

Because no rule might match (e.g. a new job type is introduced without corresponding rules), a 0% fallback must be defined. Operators receive a warning log when the fallback fires, prompting them to create a covering rule. This is preferable to an engine error that blocks commission processing.

### Preview Endpoint

The `POST /v1/commission/compute-preview` endpoint allows admins to test rule configurations against real invoice data without persisting results. This mitigates the risk of misconfigured rules going undetected until payroll time.
