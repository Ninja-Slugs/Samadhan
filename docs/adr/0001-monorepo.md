# ADR 0001: npm-workspaces monorepo

## Status

Accepted - 2026-09-04

## Context

SAMADHAN needs a web client, an HTTP API, a database access layer and shared
domain contracts. The team is small and ships during a hackathon window, so
tooling overhead has to stay low while keeping clear internal boundaries.

## Decision

Use a single Git repository with npm workspaces:

```
apps/web            Next.js App Router - UI + API route handlers
packages/database   Prisma schema, migrations, generated client
scripts/            Build/release helpers
docs/               Product and engineering documentation
```

Root `package.json` owns the workspace list and the shared `lint`,
`typecheck`, `format`, `build` and `db:*` scripts. Prettier, ESLint (flat
config via FlatCompat), Husky and lint-staged run from the root.

This mirrors the structure and build model of the reference project
(`fylmico`): one deployable web app with the backend merged in, plus a
Prisma package.

## Consequences

- One `npm install`, one CI job, shared config.
- `packages/database` is consumed through `transpilePackages` so route
  handlers import `@samadhan/database` directly without a separate build.
- If the API ever needs to scale independently it can be extracted into
  `apps/api` later; the service layer under `src/server` is already
  framework-light to make that cheap.
