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

The project is currently in the documentation and planning stage. The product and engineering foundations are documented, while the application, database migrations, CI pipeline, and deployment configuration are still to be implemented.

Follow the [progress tracker](docs/PROGRESS.md) for the current state and the [roadmap](docs/ROADMAP.md) for planned delivery.

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

## Planned Technical Direction

The documented architecture uses a web client and API service backed by Supabase Auth, Postgres, Row-Level Security, Storage, and server-side integrations for AI, maps, and notifications. The repository will use a monorepo structure with shared types, validation, UI, and configuration packages.

## Contributing

Start with [CONTRIBUTING.md](docs/CONTRIBUTING.md), then review the architecture and progress documents before beginning implementation. Changes should preserve privacy, accessibility, auditability, and human accountability across every workflow.
