# SAMADHAN API Guide

The API is the server-side boundary for authentication-aware workflows, validation, integrations, and auditability. Endpoint details in the [technical documentation](SAMADHAN_Technical_Documentation.md) remain authoritative for the initial contract.

## Conventions

- Base path: `/api/v1`
- JSON request and response bodies unless an endpoint explicitly handles multipart upload.
- ISO 8601 UTC timestamps.
- UUID resource identifiers.
- Bearer authentication for protected endpoints.
- Pagination uses `page` and `pageSize`, with a bounded maximum page size.
- Mutating requests should support an idempotency key where retries could duplicate work.

## Response Shapes

Success:

```json
{
  "data": {},
  "meta": { "requestId": "..." }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be processed.",
    "fields": { "title": "Title is required" },
    "requestId": "..."
  }
}
```

Do not return stack traces, provider errors, secrets, or private records in API errors.

## Endpoint Groups

| Group            | Representative endpoints                                                       | Access                                          |
| ---------------- | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| Auth/profile     | `GET /me`, `PATCH /me`                                                         | Authenticated user                              |
| Problems         | `GET /problems`, `POST /problems`, `GET /problems/:id`                         | Public read where safe; owner/admin write rules |
| Problem workflow | `POST /problems/:id/review`, `POST /problems/:id/status`                       | Admin or assigned authority                     |
| AI assistance    | `POST /problems/:id/priority-suggestion`, `POST /problems/:id/duplicate-check` | Authorized staff; advisory only                 |
| Universities     | `GET /universities`, `GET /universities/:id`                                   | Public verified read; owner/admin write         |
| Matching         | `POST /problems/:id/matches`                                                   | Admin or authorized university workflow         |
| Challenges       | `GET /challenges`, `POST /challenges`, `POST /challenges/:id/apply`            | Role-specific                                   |
| Projects         | `GET /projects`, `POST /projects`, `POST /projects/:id/updates`                | Team, faculty, admin rules                      |
| Industry         | `GET /partners`, `POST /partners`, `POST /projects/:id/collaborations`         | Verified partner/admin rules                    |
| Notifications    | `GET /notifications`, `POST /notifications/:id/read`                           | Current user                                    |
| Admin analytics  | `GET /admin/metrics`, `GET /admin/audit-logs`                                  | Admin only                                      |

## Validation And Authorization

- Validate every body, query, and path parameter at the API boundary.
- Check ownership and role permissions on every protected resource.
- Use allowlists for status transitions and sortable/filterable fields.
- Return `401` for missing or invalid authentication and `403` for authenticated users without permission.
- Return `404` when a resource is absent or intentionally hidden by authorization policy.
- Return `409` for invalid state transitions or idempotency conflicts.
- Rate-limit public submission, login, uploads, and AI-triggering routes.

## Versioning

Breaking changes require a new API version or a compatibility window. Document deprecations, migration steps, and removal dates before changing a public contract.
