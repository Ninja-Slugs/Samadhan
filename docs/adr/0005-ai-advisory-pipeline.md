# ADR 0005: AI as an advisory pipeline with deterministic fallback

## Status

Accepted - 2026-09-04

## Context

`docs/AI_RULES.md` is non-negotiable: AI never changes official state, every
recommendation is explainable and reviewable, and AI failure must degrade to
a deterministic rule or manual workflow rather than block a civic
submission.

## Decision

- On submission, `problems.service` runs a **best-effort** intake pipeline
  outside the request's critical path. A failure is logged and the report is
  still created.
- `analyzeProblem` tries the configured provider (Anthropic Messages API)
  with a 12s timeout, sending only title + description + district (no
  citizen identity, no precise address), validates the JSON against the
  `ProblemAnalysis` contract, and falls back to `analyzeWithRules` - a
  deterministic keyword classifier - on any error or when `AI_API_KEY` is
  unset.
- AI output is stored in `problem_ai_analysis` with `status`, `model`,
  `input_hash`, `confidence_score`, `reasons`, `uncertainties` and
  `needs_review = true`. It never writes the citizen-facing severity/urgency
  fields unless they are still empty.
- The **priority score is never produced by a model**. The
  `priority-engine` is a pure, reproducible function; AI only proposes a
  severity/urgency classification that a human can override.
- Duplicate detection produces suggestions only (`problem_duplicates` with
  component sub-scores); merges require an admin.

## Consequences

- The platform is fully functional with no AI provider configured.
- Prompt-injection surface is limited: the report is passed as data with a
  system instruction to treat it as untrusted, and malformed output is
  discarded rather than trusted.
