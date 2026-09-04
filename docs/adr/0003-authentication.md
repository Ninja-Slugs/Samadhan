# ADR 0003: Custom email + OTP authentication

## Status

Accepted - 2026-09-04

## Context

The spec assumes Supabase Auth. Merging the backend into the Next.js app
(ADR 0001) and keeping the door open to move off Supabase made a
self-contained auth model preferable for the MVP.

## Decision

- Accounts are email + password. Passwords are hashed with `bcryptjs`
  (pure JS - no native toolchain on the build host), cost factor 12.
- Signup issues a 6-digit email verification OTP (hashed, 15-minute TTL,
  max 5 attempts). Login is blocked until the address is verified.
- Sessions: a short-lived access **JWT** (15m, carries `sub`, `sid`,
  `role`) plus an opaque refresh token stored only as a SHA-256 hash in
  `sessions`. The browser client refreshes transparently on a 401.
- Self-service signup can create `citizen`, `university_admin`, `student`,
  `faculty` or `industry`. It can **never** create `admin` - government
  accounts are provisioned out of band.
- Without `RESEND_API_KEY`, verification emails are logged to the console so
  local development needs no mail provider.

## Consequences

- The access token's `role` claim is a safe first gate because it is
  short-lived and server-signed; workflow services still re-check ownership
  and, for material actions, the role from the database.
- Google OAuth and password reset are documented in the spec but not yet
  implemented.
