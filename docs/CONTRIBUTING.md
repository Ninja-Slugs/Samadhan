# Contributing To SAMADHAN

## Before Coding

- Read the relevant product section and this architecture guide.
- Identify affected roles, states, tables, policies, API endpoints, and metrics.
- Check [PROGRESS.md](PROGRESS.md) for current blockers and active work.
- For a cross-cutting decision, write an ADR before implementation.

## Implementation Workflow

1. Create a focused branch using the `codex/` prefix unless the team has agreed on another convention.
2. Implement schema changes as migrations with safe seed data when needed.
3. Add API validation and authorization before wiring the UI.
4. Add loading, empty, error, unauthorized, and mobile states.
5. Add tests for workflow rules, RLS, and important failure paths.
6. Update documentation and progress evidence.

## Pull Request Checklist

- [ ] The change has a clear user or operational outcome.
- [ ] No secrets, tokens, or personal data are committed.
- [ ] Database migrations are reversible or have a documented recovery plan.
- [ ] Authorization is tested for allowed and denied roles.
- [ ] Material changes create audit events.
- [ ] AI behavior follows [AI_RULES.md](AI_RULES.md).
- [ ] Accessibility and responsive behavior were checked.
- [ ] Tests, type checks, and lint pass.
- [ ] Documentation reflects the final behavior.

## Commit And Review Guidance

Keep commits small enough to review and describe the behavior they change. Reviewers should prioritize authorization, state transitions, data exposure, failure handling, and regressions before style preferences.
