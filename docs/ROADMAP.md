# SAMADHAN Roadmap

The roadmap is organized around proving the core civic loop first: a citizen submits a problem, government validates it, the system prioritizes and routes it, a solution team works on it, and the citizen can track the outcome.

## Delivery Principles

- Ship a complete, observable vertical slice before adding broad integrations.
- Keep AI advisory and reversible; human users own decisions.
- Prefer traceable workflows over feature count.
- Build authorization and audit logging with each module.
- Measure public value, not only usage.

## Phase 0: Foundation

Status: Not started

- [ ] Confirm product vocabulary, roles, and status enums.
- [ ] Create the monorepo and workspace conventions.
- [ ] Provision Supabase projects for development and production.
- [ ] Configure environments, secrets, migrations, storage, and baseline RLS.
- [ ] Add CI checks for type checking, linting, tests, and migration validation.
- [ ] Define seeded development data and local setup instructions.

Exit criteria: a new developer can run the project, authenticate, apply migrations, and execute CI checks.

## Phase 1: MVP Civic Loop

Status: Not started

- [ ] Public landing page and problem discovery.
- [ ] Citizen registration, login, profile, and problem submission.
- [ ] Location capture, category selection, description, and photo upload.
- [ ] Admin moderation queue and problem status transitions.
- [ ] Explainable priority scoring with manual override and audit trail.
- [ ] Duplicate suggestions for admins.
- [ ] Public problem detail page with citizen-safe updates.
- [ ] Citizen tracking dashboard and notifications.
- [ ] Basic map and filters.

Exit criteria: one validated problem can move from submission to closure with a visible timeline and auditable state changes.

## Phase 2: Knowledge and Collaboration

Status: Not started

- [ ] University profiles, departments, expertise, and capability records.
- [ ] AI-assisted university matching with explanations.
- [ ] Innovation challenge creation and application workflow.
- [ ] Student and faculty team formation.
- [ ] Project workspace with milestones, deliverables, and progress updates.
- [ ] Faculty review and admin approval workflow.

Exit criteria: an approved problem can be converted into a challenge or project and assigned to a verified academic team.

## Phase 3: Industry and Impact

Status: Not started

- [ ] Industry partner profiles and verification.
- [ ] Sponsorship, pilot, mentorship, and technology contribution workflows.
- [ ] Industry collaboration agreements and approval records.
- [ ] Impact measurement fields and outcome reporting.
- [ ] Admin analytics for resolution time, participation, and social impact.

Exit criteria: a project can receive an approved industry contribution and report measurable outcomes.

## Phase 4: Scale and Trust

Status: Not started

- [ ] Multilingual content and accessibility improvements.
- [ ] Advanced geospatial clustering and hotspot analysis.
- [ ] Search, saved views, and richer notification preferences.
- [ ] External government and institutional integrations.
- [ ] AI evaluation dashboard, model versioning, and quality monitoring.
- [ ] Operational hardening, load testing, disaster recovery drills, and retention automation.

Exit criteria: the platform meets agreed reliability, security, accessibility, and data-quality targets under representative load.

## Definition Of Done

A feature is complete when:

- [ ] The user journey and role permissions are documented.
- [ ] Database changes are migrated and protected by RLS or server authorization.
- [ ] Inputs are validated at the API boundary.
- [ ] Loading, empty, error, and unauthorized states are implemented.
- [ ] Audit events exist for material decisions and state transitions.
- [ ] Tests cover the business rules and important failure paths.
- [ ] Metrics and logs make the feature diagnosable.
- [ ] Documentation and progress status are updated.
