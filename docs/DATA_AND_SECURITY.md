# SAMADHAN Data And Security

## Data Classification

| Class        | Examples                                                           | Default handling                   |
| ------------ | ------------------------------------------------------------------ | ---------------------------------- |
| Public       | Published problem title, category, safe location, approved updates | Public read after moderation       |
| Internal     | Review notes, matching scores, operational metrics                 | Authorized staff only              |
| Confidential | Email, phone, private address, identity documents                  | Least privilege, masked by default |
| Restricted   | Auth tokens, service keys, provider credentials                    | Server secrets manager only        |

## Access Model

- Supabase Auth owns sessions.
- Profiles and role records determine the user's platform role.
- RLS is enabled on every application table.
- The API performs a second authorization check for workflow actions and privileged operations.
- Admin access is explicit, reviewable, and audited.
- Public pages expose only fields marked safe for publication.

## Row-Level Security Expectations

- Citizens can read and edit their own drafts and read safe published updates for their submissions.
- Citizens cannot read private review notes, internal scores, or another citizen's contact information.
- University and industry users can access only their organization's permitted records and approved collaborations.
- Admin policies permit operational access but still record material changes.
- Service-role access is limited to trusted server processes and never shipped to the browser.

## Upload Security

- Enforce size, MIME type, extension, and image dimension limits.
- Generate storage names; never trust user-provided paths.
- Strip EXIF and other unnecessary metadata where practical.
- Scan or quarantine files before publication.
- Keep private uploads in private buckets and issue short-lived signed URLs.
- Never render uploaded HTML or execute uploaded content.

## Audit And Privacy

Audit events should include actor, role, action, entity, timestamp, request ID, and a minimal before/after summary. Avoid copying secrets or unnecessary personal data into logs.

Collect only data needed for the stated workflow, document retention periods, provide correction and deletion processes where applicable, and separate public display data from private identity data.

## Operational Controls

- Keep secrets in environment configuration, never in Git.
- Use HTTPS in every deployed environment.
- Apply security headers, CSRF protection where applicable, input sanitization, and rate limits.
- Back up the database and test restoration, not only backup creation.
- Monitor authentication failures, authorization denials, upload failures, AI errors, and unusual admin activity.
- Define an incident response path for data exposure, account compromise, and harmful content.
