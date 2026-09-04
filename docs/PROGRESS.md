# SAMADHAN Progress

This file is the current delivery snapshot. It should describe reality, not intention. Update it at the end of each meaningful implementation session.

Last reviewed: 2026-09-02

## Current State

The repository is in the documentation and planning stage. The product specification is available, but application code, database migrations, CI, and deployment configuration have not yet been implemented.

## Workstream Status

| Workstream              | Status      | Evidence                                        | Next action                                     |
| ----------------------- | ----------- | ----------------------------------------------- | ----------------------------------------------- |
| Product definition      | Complete    | Technical specification exists                  | Resolve open product decisions before MVP build |
| Documentation structure | In progress | Focused docs are being established              | Keep docs synchronized with implementation      |
| Monorepo scaffold       | Not started | No application packages yet                     | Create workspace and app boundaries             |
| Supabase schema         | Not started | Schema is specified, not migrated               | Write first migration and seed data             |
| Authentication and RLS  | Not started | Rules are documented                            | Implement role claims and policy tests          |
| Citizen problem intake  | Not started | User journey is specified                       | Build the first vertical slice                  |
| Admin workflow          | Not started | Status model is specified                       | Implement moderation and audit events           |
| AI modules              | Not started | Priority, duplicate, and matching designs exist | Add interfaces with deterministic fallback      |
| Testing and CI          | Not started | No test suite or pipeline yet                   | Establish checks before feature work expands    |
| Deployment              | Not started | Hostinger model is documented                   | Add environment and release checklist           |

## Immediate Next Actions

- [ ] Confirm the initial repository stack and package manager.
- [ ] Scaffold `apps/web`, `apps/api`, and shared packages.
- [ ] Add environment templates without real secrets.
- [ ] Create Supabase migrations for identity, lookup, and problem intake tables.
- [ ] Implement authentication, role resolution, and baseline RLS tests.
- [ ] Deliver citizen submission and admin moderation as one vertical slice.

## Active Risks

| Risk                                                | Impact                                   | Mitigation                                                    | Owner                 |
| --------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- | --------------------- |
| Role claims and RLS drift from UI assumptions       | Unauthorized access or blocked workflows | Test policies independently and enforce server checks         | Engineering           |
| AI recommendations are treated as decisions         | Trust, fairness, and safety problems     | Require explanations, confidence, review, and overrides       | Product + Engineering |
| Duplicate detection merges distinct public problems | Loss of issue visibility                 | Suggest duplicates only; require human confirmation           | Product               |
| Uploads contain unsafe or sensitive content         | Security and privacy exposure            | Validate type and size, scan, quarantine, and restrict access | Engineering           |
| Scope expands before the civic loop works           | Delayed usable release                   | Hold Phase 2 and 3 features behind MVP exit criteria          | Product               |

## Decision Log

| Date       | Decision                                                                | Reason                                                                |
| ---------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 2026-09-02 | Keep the long technical document as the canonical product specification | Preserves complete context while focused docs support execution       |
| 2026-09-02 | AI recommendations remain advisory                                      | Human accountability is required for civic prioritization and routing |
| 2026-09-02 | Use migration-first database changes                                    | Makes environments reproducible and reviewable                        |

## Update Template

When updating this file, add the date and record:

- What changed since the last review.
- What is blocked and why.
- Evidence such as tests, migrations, screenshots, or deployed URLs.
- The next smallest action that moves the roadmap forward.
