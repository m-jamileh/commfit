# ADR-002: Service Abstraction Pattern (Abstract Class as Injectable Token)

**Status**: Accepted
**Date**: 2026-05-20
**Deciders**: Principal Architect

---

## Context

Comm-Fit Service integrates with six external systems:

1. **Email** — transactional email delivery (e.g. SendGrid, SES)
2. **Payment** — card collection and charging (Stripe)
3. **eSign** — digital signature workflows (DocuSign)
4. **Warranty** — manufacturer warranty lookup
5. **ERP** — enterprise resource planning sync
6. **CRM** — customer relationship management sync

At M1, none of these integrations are implemented. The system must compile, type-check, and have a clean architecture that makes implementing (or swapping) each integration at M3 a localized change — not a refactor.

---

## Decision

Each external integration is represented as an `@Injectable()` abstract class in `apps/api/src/services/<name>/<name>.service.ts`. The abstract class serves as the NestJS injection token. Feature modules consume the abstract class by type; they never import a concrete implementation.

Concrete implementations (mock at M2, real at M3) are provided via `useClass` in the module's `providers` array, keyed against the abstract class token:

```typescript
// M2 mock example (future)
@Module({
  providers: [
    {
      provide: EmailService,
      useClass: MockEmailService,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
```

The shared-types package (`@commfit/shared-types`) also defines matching abstract interfaces for use outside the NestJS layer (e.g. in the worker app or type-check-only contexts).

---

## Rationale

### Swap Without Touching Feature Code

Feature modules (`jobs`, `invoices`, `commission`, etc.) depend only on the abstract token. Replacing `MockEmailService` with `SendGridEmailService` at M3 requires zero changes in feature modules — only the `EmailModule` provider registration changes.

### Compile-Time Contract Enforcement

TypeScript enforces that every concrete implementation satisfies the abstract interface at compile time. A missing `send()` method or wrong return type causes a build error, not a runtime failure.

### NestJS Injection Token Semantics

NestJS uses the class reference itself as the injection token. Using an abstract class (not an interface) preserves the token at runtime after TypeScript compilation, since interfaces are erased. This is the standard NestJS pattern for swappable providers.

### POC-to-Production Shape

By defining the correct abstract shapes at M1, the POC already demonstrates the production architecture. The CTO can evaluate the contract without waiting for concrete implementations.

---

## Consequences

### Accepted Tradeoffs

- **Extra module per abstraction**: Six service abstraction modules are required in addition to the fifteen domain modules. This adds files but each is minimal (< 15 lines).
- **No mock yet at M1**: The `@Module` provider arrays for service abstractions are empty at M1 (abstract class cannot be instantiated). Feature modules that attempt to inject the service at runtime will fail until M2/M3 concrete implementations are provided. This is acceptable because M1 is a type-check deliverable, not a runtime deliverable.
- **Namespace collision risk**: The abstract class name (e.g. `EmailService`) may clash with NestJS convention. Mitigation: suffix concrete implementations with their vendor name (e.g. `SendGridEmailService`, `StripePaymentService`).

### Not Affected

- The abstract class pattern does not require `reflect-metadata` changes beyond what NestJS already configures.
- Unit tests for feature services can inject a mock directly using `useValue` without the service abstraction module being fully wired.
