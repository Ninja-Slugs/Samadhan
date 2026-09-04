# SAMADHAN

SAMADHAN is a civic problem-solving platform that turns real community problems into trackable, collaborative solutions.

It connects citizens who report problems with government teams who validate and prioritize them, universities and students who design solutions, faculty who guide projects, and industry partners who can support pilots and implementation.

## What We Are Building

Today, civic problems are often reported across disconnected channels. It can be difficult to understand whether a problem has been acknowledged, who is responsible for it, what progress has been made, or how a proposed solution can move from an idea to real-world impact.

SAMADHAN creates one transparent workflow:

```text
Citizen reports a problem
        -> Government validates and prioritizes it
        -> Universities, students, and experts propose solutions
        -> Approved teams collaborate on a project
        -> Industry can support pilots and implementation
        -> Citizens track progress and outcomes
```

The platform uses AI to assist with prioritization, duplicate detection, summarization, and university matching. AI recommendations remain explainable, reviewable, and advisory; people make the official decisions.

## Core Users

- Citizens submit problems, follow updates, and see outcomes.
- Government and administrators moderate submissions, prioritize work, assign ownership, and monitor impact.
- Universities and faculty contribute expertise, facilities, and mentorship.
- Students join challenges, form teams, and build solutions.
- Industry partners provide funding, technology, mentorship, pilots, or implementation support.

## MVP Focus

The first release will prove the complete civic loop:

- Citizen registration and problem submission
- Location, category, description, and photo capture
- Admin moderation and status management
- Explainable priority scoring with human override
- Duplicate problem suggestions
- Public problem pages and citizen tracking
- Notifications and a basic geographic problem map

Later phases add university matching, innovation challenges, student and faculty collaboration, industry partnerships, and social-impact analytics.

## Project Status

The monorepo scaffold and the MVP civic-loop vertical slice are implemented and building green. A citizen can register, verify their email, file a report, and follow it through AI triage, government review, transparent prioritisation and status updates on a tracking timeline; an admin can work the review queue with verify / reject / request-info decisions, overrides and an audit trail.

Follow the [progress tracker](docs/PROGRESS.md) for the current state and the [roadmap](docs/ROADMAP.md) for planned delivery.

## Quick Start

```bash
cp .env.example .env            # set JWT_ACCESS_SECRET and DATABASE_URL
docker compose up -d postgres   # or point DATABASE_URL at any Postgres 16
npm install
npm run db:migrate              # apply Prisma migrations
npm run db:seed                 # load the category taxonomy + sample universities
npm run dev                     # http://localhost:3000
```

Promote your first admin after signing up and verifying:
`UPDATE users SET role = 'admin' WHERE email = '<you>';`

Without `AI_API_KEY` the platform runs on the deterministic rule-based
analyzer; without `RESEND_API_KEY` verification codes are printed to the
server console.

## Repository Layout

```
apps/web/                 Next.js App Router - UI + /api/v1 route handlers
  src/app/                pages ((app) = session-gated) and API routes
  src/server/<domain>/    domain services + DTOs (auth, problems, admin,
                          priority, ai, matching, notifications)
  src/lib/                browser API client, session, shared types
packages/database/        Prisma schema, migrations, dev seed
docs/                     product spec, architecture, ADRs, roadmap
```

See [MASTER_INDEX.md](MASTER_INDEX.md) for a fuller map and
[docs/adr/](docs/adr/) for the decisions behind this shape.

## Documentation

The [documentation index](docs/README.md) explains where to start. The main references are:

- [Technical documentation](docs/SAMADHAN_Technical_Documentation.md): complete product and implementation specification
- [Architecture](docs/ARCHITECTURE.md): system boundaries, data ownership, and design rules
- [Roadmap](docs/ROADMAP.md): phased delivery plan and definition of done
- [Progress](docs/PROGRESS.md): current workstreams, risks, decisions, and next actions
- [AI rules](docs/AI_RULES.md): safety, privacy, explainability, and evaluation requirements
- [API guide](docs/API.md): API conventions, endpoint groups, and error handling
- [Data and security](docs/DATA_AND_SECURITY.md): authorization, RLS, uploads, audit, and privacy
- [Contributing](docs/CONTRIBUTING.md): development and review workflow

## Technical Direction

An npm-workspaces monorepo with a single deployable Next.js app: the App
Router serves both the UI and the `/api/v1` route handlers, backed by
PostgreSQL through Prisma (`packages/database`), with server-side adapters
for the AI provider, mail and (planned) Supabase Storage and Realtime.
Authentication is custom email + OTP with a short-lived access JWT and an
opaque refresh token; authorization is enforced in the API service layer.
AI is advisory only, with a deterministic rule-based fallback so no feature
depends on a model being reachable. Deployment targets a Hostinger Node.js
app running the standalone build, with migrations applied from CI.

These choices, and where they deviate from the specification above, are
recorded in [docs/adr/](docs/adr/).

## Contributing

Start with [CONTRIBUTING.md](docs/CONTRIBUTING.md), then review the architecture and progress documents before beginning implementation. Changes should preserve privacy, accessibility, auditability, and human accountability across every workflow.
