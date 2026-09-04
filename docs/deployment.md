# SAMADHAN Deployment Runbook

Target: a **Hostinger Node.js application** serving the standalone Next.js
build, with **Supabase** as the managed PostgreSQL backend (and, later,
Storage and Realtime). See [ADR 0006](adr/0006-deployment-hostinger.md) for
why this shape.

```
GitHub (main)
  ├─ CI workflow      lint + typecheck + format + build
  ├─ Migrate workflow prisma migrate deploy  ──►  Supabase Postgres
  └─ Hostinger deploy hook  ──►  npm install && npm run build && npm start
                                     (apps/web standalone via root server.js)
```

The deploy and the migration run are **independent**. The migration job is
written to tolerate the app briefly holding connections during a rollout.

---

## 1. Supabase

1. Create the project. Region close to Hostinger's.
2. **Project Settings → Database → Connection string**. Two you will use:
   - **Session pooler** (`...pooler.supabase.com:5432`) - for migrations and
     as a safe default for the app.
   - **Transaction pooler** (`...pooler.supabase.com:6543`) - lower latency
     for a long-running server; append `?pgbouncer=true` and Prisma will
     disable prepared statements.
3. URL-encode the password in the string (`@` → `%40`, `#` → `%23`, …).
4. Do **not** enable Supabase's own GitHub "Migrations" integration - it
   expects `supabase/migrations/*.sql` in Supabase CLI format. This repo
   uses Prisma migrations under `packages/database/prisma/migrations`,
   applied by the workflow below.

## 2. GitHub Actions secret

Repo → **Settings → Secrets and variables → Actions → New repository
secret**:

| Name           | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| `DATABASE_URL` | the **session pooler** string (port 5432) with the encoded password |

`.github/workflows/migrate.yml` then runs on every push to `main` (and via
**Run workflow** in the Actions tab). It appends
`connection_limit=1&pool_timeout=15` and retries `prisma migrate deploy`
with backoff up to 6 times.

First deploy: push to `main` or trigger the workflow manually; it applies
`20260904090000_init`.

Seed data (category taxonomy + sample universities) is not part of the
migration - run it once against the target database:

```bash
DATABASE_URL="<session pooler string>" \
  npm run db:seed --workspace=@samadhan/database
```

## 3. Hostinger Node.js app

**hPanel → Websites → your domain → Advanced → Node.js** (or the "Node.js
app" card):

| Setting                  | Value                                      |
| ------------------------ | ------------------------------------------ |
| Node version             | 22.x (matches `engines` / `.nvmrc` intent) |
| Application root         | repository root                            |
| Application startup file | `server.js`                                |
| Build command            | `npm install && npm run build`             |
| Start command            | `npm start`                                |

`npm run build` builds `@samadhan/database` (Prisma generate) then the
standalone Next build; `postbuild` mirrors `.next/static` and `public/`
into the standalone bundle. `npm start` runs the root `server.js`, which
re-execs `apps/web/.next/standalone/apps/web/server.js`.

### Environment variables (hPanel Node.js app → Environment)

| Var                                                          | Required | Notes                                                                                                                                  |
| ------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                               | yes      | Transaction pooler (`:6543?pgbouncer=true`) or session pooler (`:5432`). `src/server/prisma.ts` caps the pool at `connection_limit=5`. |
| `JWT_ACCESS_SECRET`                                          | yes      | `openssl rand -hex 32`. Rotating it logs everyone out.                                                                                 |
| `JWT_ACCESS_TTL`                                             | no       | default `15m`                                                                                                                          |
| `JWT_REFRESH_TTL`                                            | no       | default `30d`                                                                                                                          |
| `NEXT_PUBLIC_APP_URL`                                        | yes      | `https://your-domain`                                                                                                                  |
| `NEXT_PUBLIC_APP_NAME`                                       | no       | default `SAMADHAN`                                                                                                                     |
| `NODE_ENV`                                                   | yes      | `production`                                                                                                                           |
| `NEXT_TELEMETRY_DISABLED`                                    | no       | `1`                                                                                                                                    |
| `RESEND_API_KEY`                                             | no       | without it, verification OTPs are written to the server log instead of emailed                                                         |
| `MAIL_FROM`                                                  | no       | e.g. `SAMADHAN <noreply@your-domain>`                                                                                                  |
| `AI_API_KEY`                                                 | no       | Anthropic key; without it the deterministic rule-based analyzer runs                                                                   |
| `AI_MODEL`                                                   | no       | default `claude-sonnet-5`                                                                                                              |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`                 | later    | needed once problem-media upload is wired to Storage                                                                                   |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | later    | needed once Realtime status updates are wired                                                                                          |
| `TOKIO_WORKER_THREADS`                                       | no       | set to `2` only if the account hits its process ceiling during builds                                                                  |

Never put these in Git. `.env*` is git-ignored except the `.env.example`
files.

### TOKIO/CPU note

`next.config.ts` pins `experimental.cpus: 2` and `prisma.ts` caps the
connection pool because Hostinger's container over-reports its CPU count.
If builds still trip the "Max Processes" limit, add `TOKIO_WORKER_THREADS=2`
to the environment.

## 4. First deploy checklist

- [ ] Supabase project created; password reset and encoded.
- [ ] `DATABASE_URL` added as a GitHub Actions secret (session pooler).
- [ ] Migrate workflow run green (Actions tab) - `init` applied.
- [ ] Seed run once against Supabase.
- [ ] Hostinger Node.js app configured (root, `server.js`, build/start).
- [ ] Runtime env vars set (`DATABASE_URL`, `JWT_ACCESS_SECRET`,
      `NEXT_PUBLIC_APP_URL`, `NODE_ENV=production`).
- [ ] Deploy; hit `https://your-domain/api/v1/health` → `{"status":"ok"}`.
- [ ] Sign up, read the OTP from the app log (or email if Resend is set),
      verify, file a test report.
- [ ] Promote your admin:
      `UPDATE users SET role = 'admin' WHERE email = '<you>';`
- [ ] Confirm the review queue loads and a verify writes an `activity_logs`
      row.

## 5. Rollback

- **App**: redeploy the previous commit from the Hostinger deploy history
  (or `git revert` + push).
- **Schema**: Prisma migrations are forward-only. To undo, write a new
  migration that reverses the change and let the workflow apply it. Supabase
  keeps automatic daily backups (Project Settings → Database → Backups) for
  point-in-time restore of data.

## 6. Local production parity

```bash
docker compose up --build
```

Brings up the app (multi-stage `Dockerfile`, standalone runner) plus
Postgres 16 on `:3000` / `:5432` with a throwaway `JWT_ACCESS_SECRET`.
