# ADR 0006: Hostinger Node.js deployment of the standalone Next build

## Status

Accepted - 2026-09-04

## Context

Hosting is a Hostinger Node.js app. Supabase is the managed Postgres (and,
later, Storage/Realtime) backend.

## Decision

- `apps/web` builds with `output: "standalone"`. The repo-root `server.js`
  re-execs `apps/web/.next/standalone/apps/web/server.js`, so Hostinger's
  `npm start` boots the production server.
- `scripts/sync-next-standalone-assets.mjs` (run as `postbuild`) mirrors
  `.next/static` and `public/` into the standalone bundle, which Next does
  not copy itself.
- `next build` is pinned to `experimental.cpus: 2` and Prisma to
  `connection_limit=5`, because the container over-reports its CPU count
  and would otherwise exhaust the process ceiling / connection pool.
- Migrations run from GitHub Actions (`migrate.yml`) on push to `main`, not
  from the app boot, with a single connection and backoff retry.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, HSTS,
  `Referrer-Policy`) are set in `next.config.ts`. HTTPS is terminated by
  Hostinger.
- `Dockerfile` + `docker-compose.yml` give local prod parity (web +
  postgres 16) and an alternative container target.

## Consequences

- Secrets (`DATABASE_URL`, `JWT_ACCESS_SECRET`, provider keys) live in the
  Hostinger environment and GitHub Actions secrets, never in Git.
- A deploy and a migration run are independent; the migration job is
  written to tolerate the app briefly holding connections during a rollout.
