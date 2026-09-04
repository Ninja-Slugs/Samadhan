# SAMADHAN Master Index

The first document to read before working on SAMADHAN.

## Core Documents

- [README.md](README.md) - project overview, quick start, repo layout.
- [docs/README.md](docs/README.md) - documentation map.
- [docs/SAMADHAN_Technical_Documentation.md](docs/SAMADHAN_Technical_Documentation.md) - canonical product specification.
- [docs/AI_RULES.md](docs/AI_RULES.md) - non-negotiable rules for every AI feature.

## Engineering

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - runtime boundaries, ownership, state machines.
- [docs/API.md](docs/API.md) - API conventions and endpoint groups.
- [docs/DATA_AND_SECURITY.md](docs/DATA_AND_SECURITY.md) - data classes, authorization, uploads, audit.
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) - branching, workflow, PR checklist.
- [docs/deployment.md](docs/deployment.md) - Hostinger + Supabase runbook, CI migrations, env vars.
- [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma) - the schema source of truth.

## Delivery

- [docs/ROADMAP.md](docs/ROADMAP.md) - phased plan and definition of done.
- [docs/PROGRESS.md](docs/PROGRESS.md) - current implementation state.

## Decisions

- [docs/adr/](docs/adr/) - architecture decision records (start at
  [0001](docs/adr/0001-monorepo.md)).

## Where things live

| Area                        | Path                                                       |
| --------------------------- | ---------------------------------------------------------- |
| UI pages                    | `apps/web/src/app` (`(app)` = session-gated)               |
| API route handlers          | `apps/web/src/app/api/v1`                                  |
| Domain services             | `apps/web/src/server/<domain>` (service + `dto/`)          |
| Priority engine             | `apps/web/src/server/priority`                             |
| AI analyzer                 | `apps/web/src/server/ai`                                   |
| Shared HTTP/auth/rate-limit | `apps/web/src/server/{http,auth,rate-limit,pagination}.ts` |
| Browser API client          | `apps/web/src/lib/api/client.ts`                           |
| Schema + migrations + seed  | `packages/database/prisma`                                 |
