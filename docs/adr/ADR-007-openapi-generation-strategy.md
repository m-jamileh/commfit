# ADR-007: OpenAPI Generation Strategy — Code-First, Decorator-Driven

**Status**: Accepted
**Date**: 2026-05-20
**Deciders**: Principal Architect

---

## Context

There are two approaches to maintaining an OpenAPI specification for an HTTP API:

1. **Design-first (spec-first)**: An OpenAPI YAML/JSON file is hand-authored as the source of truth. Code is generated from it (server stubs, client SDKs) or must manually match it.
2. **Code-first (decorator-driven)**: The OpenAPI spec is generated automatically from the code. In NestJS, `@nestjs/swagger` reflects on controller decorators (`@ApiTags`, `@ApiOperation`, `@ApiProperty`, etc.) and TypeScript types to produce the spec at runtime.

---

## Decision

Comm-Fit Service uses **code-first, decorator-driven OpenAPI generation** via `@nestjs/swagger`.

The OpenAPI spec is served at `GET /v1/openapi.json` and the Swagger UI at `GET /v1/openapi`. The spec is the **output**, not the input. No OpenAPI YAML files are committed to the repository.

At M1, the spec is sparse (stub controllers return 501). Decorators are filled in progressively as controllers are implemented at M2/M3.

When a consumer package (e.g. a TypeScript API client) is generated from the spec, it must be regenerated after any controller change. A future CI step (M3+) will enforce this by running `openapi-generator` and asserting a clean diff.

---

## Rationale

### Single Source of Truth in Controllers

With code-first, the controller file contains both the implementation and the spec metadata (via decorators). There is no risk of the spec drifting from the implementation because they live in the same file. Design-first requires keeping two artifacts in sync, which always drifts under deadline pressure.

### Progressive Enhancement

At M1, stub controllers need only `@ApiTags` and `@ApiOperation`. As feature implementation proceeds at M2/M3, `@ApiBody`, `@ApiResponse`, and `@ApiProperty` on DTO classes are added incrementally. The spec improves in step with the implementation without requiring a separate spec-authoring phase.

### NestJS Ecosystem Alignment

`@nestjs/swagger` is the officially supported Swagger integration for NestJS. It uses TypeScript reflection (via `reflect-metadata` and Swagger plugin) to infer types from DTO class properties automatically. This reduces decorator boilerplate: DTOs annotated with `class-validator` decorators are partially inferred by the Swagger CLI plugin without explicit `@ApiProperty` on every field.

### No Spec Drift

Because the spec is generated from running code, it always reflects the actual behavior of the deployed API. Design-first specs frequently describe endpoints that do not yet exist or have been changed without updating the spec.

---

## Consequences

### Spec Is Not Version-Controlled (at M1)

The generated `openapi.json` is not committed to the repository at M1. It is produced at runtime by the running API. Consequence: the spec cannot be diffed in PRs. Mitigation (M3): add a CI step that runs `nest start` headlessly, fetches `/v1/openapi.json`, and compares it to a committed baseline. A diff fails the build.

### Consumer Client Must Be Regenerated on Controller Changes

Any client package that is generated from the spec (TypeScript fetch client, mobile SDK, etc.) must be regenerated whenever a controller signature changes. At M1 there are no generated clients, so this is a future concern. The regeneration command and the CI gate must be documented and enforced by M3.

### Decorator Discipline Required

Developers must add `@ApiOperation`, `@ApiResponse`, and `@ApiBody` decorators to every endpoint as part of the feature implementation PR — not retroactively. This is a code review requirement, not a build check at M1. A Swagger-completeness lint rule may be added at M3.

### Swagger UI Access Control

The Swagger UI at `/v1/openapi` must be disabled in production (or secured behind admin auth) by M3. At M1/M2 (local dev and staging only), it is publicly accessible for developer convenience.
