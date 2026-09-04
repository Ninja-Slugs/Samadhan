# ADR 0004: Authorization in the API service layer

## Status

Accepted - 2026-09-04

## Context

The spec leans on Supabase Row-Level Security. With Prisma and a merged
backend (ADR 0001, 0002) there is no Supabase session in the request path,
so RLS cannot be the primary control.

## Decision

Every `/api/v1` route handler runs an explicit check before touching data:

- `requireUser` / `requireRole(...roles)` verify the access token and gate
  by role.
- Services re-check record ownership (`problem.citizenId === requesterId`)
  and re-read the authoritative role from the database for material
  actions.
- Problem detail is projected per audience: `public` (moderated fields
  only), `owner` (adds AI summary + uncertainties, labelled advisory) and
  `admin` (full record, citizen contact, duplicates, audit events).
- Status transitions are a hard-coded allow-list
  (`ALLOWED_TRANSITIONS`); anything else is `409`.
- Material actions (verify, reject, priority override, transition) write an
  `activity_logs` row with actor, before/after and a minimal metadata
  summary.

## Consequences

- Authorization logic is unit-testable without a database session.
- RLS can still be added later as defence in depth without reworking the
  API.
- Public list endpoints must be careful to filter to `PUBLIC_STATUSES`;
  this is centralised in `problems.service`.
