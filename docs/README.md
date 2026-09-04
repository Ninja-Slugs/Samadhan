# SAMADHAN Documentation

This directory contains the working documentation for SAMADHAN, a civic problem-solving platform connecting citizens, government, universities, students, faculty, and industry.

## Start Here

1. Read the [technical documentation](SAMADHAN_Technical_Documentation.md) for the complete product and implementation specification.
2. Use the [architecture guide](ARCHITECTURE.md) when adding or changing system components.
3. Use the [roadmap](ROADMAP.md) to select work and understand delivery sequencing.
4. Update [progress](PROGRESS.md) whenever a milestone, decision, or blocker changes.
5. Follow the [AI rules](AI_RULES.md) for all AI-assisted features.

## Document Map

| Document                                                       | Purpose                                                                     |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Technical Documentation](SAMADHAN_Technical_Documentation.md) | Full product, UX, API, data, security, and deployment specification         |
| [Architecture](ARCHITECTURE.md)                                | Runtime boundaries, ownership, data flow, and architectural decisions       |
| [Roadmap](ROADMAP.md)                                          | Phased delivery plan and definition of done                                 |
| [Progress](PROGRESS.md)                                        | Current implementation status, decisions, risks, and next actions           |
| [AI Rules](AI_RULES.md)                                        | Safety, privacy, explainability, and operational rules for AI               |
| [API Guide](API.md)                                            | API conventions, endpoint groups, validation, and error handling            |
| [Data and Security](DATA_AND_SECURITY.md)                      | Data classification, authorization, RLS, uploads, audit, and backups        |
| [Contributing](CONTRIBUTING.md)                                | Branching, implementation workflow, testing, and documentation standards    |
| [Deployment Runbook](deployment.md)                            | Hostinger + Supabase setup, CI migrations, env vars, first-deploy checklist |
| [ADRs](adr/README.md)                                          | Architecture decision records (start at 0001)                               |

## Maintenance Rules

- Keep the technical documentation authoritative for product intent and the focused documents practical for day-to-day work.
- Record architectural changes in `ARCHITECTURE.md` before implementation when they affect boundaries, data ownership, or security.
- Record current state in `PROGRESS.md`; do not use it as a second backlog.
- Every new feature should identify its user role, data owner, authorization rule, API surface, and measurable outcome.
- Treat security, privacy, accessibility, and auditability as acceptance criteria, not follow-up work.
