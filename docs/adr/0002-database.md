# ADR 0002: PostgreSQL via Prisma, migration-first

## Status

Accepted - 2026-09-04

## Context

The technical specification describes a relational schema (problems, AI
analysis, priority, universities, challenges, projects, audit) and calls for
reproducible environments.

## Decision

- PostgreSQL as the single database (Supabase-hosted in deployment, plain
  `postgres:16` locally via `docker-compose`).
- Prisma as the schema source of truth and query layer, in
  `packages/database`.
- Every schema change is a checked-in SQL migration under
  `packages/database/prisma/migrations`. `prisma migrate deploy` runs from
  CI on push to `main` (`.github/workflows/migrate.yml`) with a
  single-connection cap and backoff retry.
- `cuid()` primary keys. Where a citizen or partner must quote an identifier
  (a problem), a separate `public_id` (`SMD-XXXX-XXXX`) is generated; it is
  not an access token.
- Status columns are Postgres enums so the state machine has fixed edges.
- AI output lives in its own tables (`problem_ai_analysis`) and never
  overwrites citizen-submitted fields.

## Consequences

- Deviates from the spec's "Supabase client + RLS as the primary access
  path": authorization is enforced in the API service layer instead (see
  ADR 0004). RLS can be layered on later as defence in depth.
- The connection pool is explicitly capped (`connection_limit=5`) because
  containerised hosts over-report CPU count.
