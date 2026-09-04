# SAMADHAN Progress

This file is the current delivery snapshot. It should describe reality, not intention. Update it at the end of each meaningful implementation session.

Last reviewed: 2026-09-04

## Current State

The monorepo scaffold and the MVP civic-loop vertical slice are implemented
and building green (`npm run lint && npm run typecheck && npm run build`).
A citizen can register, verify their email, file a report, and watch it move
through AI triage, government review, transparent prioritisation and status
changes on a tracking timeline; an admin can work the review queue.

Architecture deviates from the original spec in three documented ways
(see `docs/adr/`): a single merged Next.js app instead of `apps/web` +
`apps/api`, Prisma + migration-first Postgres instead of the Supabase
client as the primary path, and authorization enforced in the API service
layer instead of Supabase RLS.

## Workstream Status

| Workstream              | Status   | Evidence                                                               | Next action                                    |
| ----------------------- | -------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| Product definition      | Complete | Technical specification exists                                         | Resolve open product decisions                 |
| Documentation structure | Complete | Focused docs + ADRs 0001-0006 + master index                           | Keep synchronised with implementation          |
| Monorepo scaffold       | Complete | npm workspaces, shared lint/format/typecheck, Husky, CI                | -                                              |
| Database schema         | Complete | `schema.prisma`, `20260904090000_init` migration, dev seed             | Add challenge/project/impact migrations        |
| Authentication          | Complete | email + OTP verify, JWT access + opaque refresh (ADR 0003)             | Google OAuth, password reset                   |
| Citizen problem intake  | Complete | report form, public id, media metadata model, tracking timeline        | File upload to Supabase Storage                |
| AI triage               | Complete | provider call + deterministic rule fallback, stored analysis           | Evaluation fixtures + acceptance metrics       |
| Priority engine         | Complete | deterministic 0-100 with per-component reasons, manual override        | Tune weights against real reports              |
| Duplicate detection     | Basic    | composite similarity suggestions with sub-scores                       | Cluster view + merge workflow                  |
| Admin workflow          | Complete | review queue, verify/reject/request-info, transitions, audit logs      | Duplicate review UI, university assignment     |
| University matching     | Basic    | ranked with cited reason codes                                         | Challenge creation + acceptance flow           |
| Notifications           | Basic    | in-app records + unread count on citizen state changes                 | Realtime + email digests                       |
| Testing and CI          | Partial  | CI runs lint + typecheck + format + build                              | Add unit tests for priority/auth/state machine |
| Deployment              | Ready    | standalone build, `server.js`, migrate workflow, Dockerfile (ADR 0006) | First Hostinger deploy + smoke test            |

## Immediate Next Actions

- [ ] Provision the Supabase project; set `DATABASE_URL` + `JWT_ACCESS_SECRET` in Hostinger and GitHub secrets; run the first deploy.
- [ ] Add unit tests for the priority engine, the transition allow-list and auth.
- [ ] Wire problem-media upload to Supabase Storage with type/size validation.
- [ ] Build the admin duplicate-cluster review and university-assignment / challenge-creation flow.

## Active Risks

| Risk                                                | Impact                                   | Mitigation                                                    | Owner                 |
| --------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- | --------------------- |
| Role claims and RLS drift from UI assumptions       | Unauthorized access or blocked workflows | Test policies independently and enforce server checks         | Engineering           |
| AI recommendations are treated as decisions         | Trust, fairness, and safety problems     | Require explanations, confidence, review, and overrides       | Product + Engineering |
| Duplicate detection merges distinct public problems | Loss of issue visibility                 | Suggest duplicates only; require human confirmation           | Product               |
| Uploads contain unsafe or sensitive content         | Security and privacy exposure            | Validate type and size, scan, quarantine, and restrict access | Engineering           |
| Scope expands before the civic loop works           | Delayed usable release                   | Hold Phase 2 and 3 features behind MVP exit criteria          | Product               |

## Decision Log

| Date       | Decision                                                                  | Reason                                                                |
| ---------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 2026-09-02 | Keep the long technical document as the canonical product specification   | Preserves complete context while focused docs support execution       |
| 2026-09-02 | AI recommendations remain advisory                                        | Human accountability is required for civic prioritization and routing |
| 2026-09-02 | Use migration-first database changes                                      | Makes environments reproducible and reviewable                        |
| 2026-09-04 | Merge the backend into `apps/web` as route handlers (ADR 0001)            | One deployable unit fits the hackathon window and the Hostinger model |
| 2026-09-04 | Prisma + Postgres; authorization in the service layer, not RLS (ADR 0004) | No Supabase session in the request path once the backend is merged    |
| 2026-09-04 | Custom email + OTP auth instead of Supabase Auth (ADR 0003)               | Keeps the option open to move off Supabase; self-contained for MVP    |

## Update Template

When updating this file, add the date and record:

- What changed since the last review.
- What is blocked and why.
- Evidence such as tests, migrations, screenshots, or deployed URLs.
- The next smallest action that moves the roadmap forward.
