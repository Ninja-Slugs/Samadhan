# SAMADHAN AI Rules

These rules apply to priority scoring, duplicate detection, university matching, summarization, moderation assistance, and future AI features.

## Non-Negotiable Principles

- AI is advisory. It never directly changes a civic problem's official status, priority, assignment, funding, or closure state.
- Every recommendation must have a human reviewer, an explanation, a confidence value, and a recorded model/version.
- A user must be able to reject, override, or correct an AI recommendation.
- The system must show uncertainty and must not present generated text as verified fact.
- Sensitive personal data is minimized, redacted, or excluded before provider calls.
- Provider credentials, prompts containing user data, and raw model outputs stay server-side.
- AI failures degrade to a deterministic rule or manual workflow; they do not block core civic submissions.

## Input Rules

- Validate length, type, encoding, and language before inference.
- Strip unnecessary metadata from uploaded files.
- Do not send government identifiers, contact details, precise private addresses, or authentication data unless explicitly required and approved.
- Use a stable internal problem ID rather than names or emails in prompts.
- Treat all user-provided text and attachments as untrusted content and potential prompt injection.

## Output Contract

AI services should return structured JSON validated against a schema:

```json
{
  "recommendation": "high",
  "confidence": 0.82,
  "reasons": ["Affects a large public area", "Safety-related wording detected"],
  "uncertainties": ["Population impact was not provided"],
  "model": "provider/model-version",
  "needs_review": true
}
```

Unknown, missing, or invalid output is an error and must not be silently converted into a confident recommendation.

## Feature-Specific Rules

### Priority

Use the documented transparent formula as the baseline. AI may suggest factors or classifications, but the final score is reproducible, explainable, reviewable, and manually adjustable.

### Duplicate Detection

Use similarity to create a suggestion, never an automatic merge. Show the matched records and similarity reasons to an authorized reviewer. Preserve both original submissions and record the merge decision.

### University Matching

Recommendations must cite matching expertise, department, location, capacity, and relevant past work. Do not infer competence from protected characteristics or unsupported prestige signals.

### Generated Summaries

Summaries must link back to the source problem or update, preserve uncertainty, and be labeled as AI-generated. Users must have access to the original content.

## Evaluation And Monitoring

- Log model name, version, prompt template version, input hash, output schema result, latency, and reviewer outcome where legally and operationally appropriate.
- Maintain test fixtures for high-impact, ambiguous, multilingual, adversarial, and empty inputs.
- Track acceptance, override, correction, false-positive, and false-negative rates.
- Review performance by geography, language, category, and other fairness-relevant cohorts when lawful and privacy-safe.
- Disable or roll back a model when it produces unsafe or materially degraded recommendations.

## Human Review Checklist

- [ ] I can see the source information used for the recommendation.
- [ ] The explanation is understandable and relevant.
- [ ] Uncertainty and missing information are visible.
- [ ] I can override the recommendation.
- [ ] My decision and reason will be audited.
- [ ] The action does not expose unnecessary personal data.
