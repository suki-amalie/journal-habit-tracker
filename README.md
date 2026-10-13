# Hibi

**A personal journaling and habit-tracking app designed to help people reflect, build consistency, and understand their own growth.**

Hibi combines a daily journal with a habit tracker. Its design direction is warm and minimal, inspired by paper journals and literary typography. The longer-term vision is to help people discover connections across their past writing without taking control away from them.

> **Project status:** Active development. Core journaling, habit tracking, and authentication flows have been implemented and tested locally. Production deployment and the private beta are planned, not yet complete.

## Current features

- **Journal entries:** Write and manage journal entries.
- **Journal history:** Browse past writing through a notebook-style presentation.
- **Draft recovery:** New-entry drafts and edits to existing entries are persisted in browser `localStorage`, helping recover unfinished writing after refreshes or session expiry.
- **Habit tracking:** Create and manage habits, record completions, and review activity through heatmaps.
- **User accounts:** Register, log in, and log out.
- **Protected data:** Journal entries, habits, and habit completions are scoped to the authenticated user.
- **Session handling:** Server-side sessions use random tokens, with only token hashes stored in the database. The browser receives an `HttpOnly` session cookie.
- **Expired-session handling:** Protected API requests that return `401` clear the client query cache and redirect the user to login.

See [the feature status](docs/roadmap.md) for the distinction between implemented and planned work.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Routing and data fetching | React Router, TanStack Query |
| Styling and icons | Tailwind CSS, lucide-react |
| Backend | Node.js, Express 5, TypeScript |
| Database access | Prisma ORM |
| Database | PostgreSQL |
| Authentication | Argon2 password hashing, server-side sessions, HTTP cookies |
| Testing | Frontend lint/build/tests and backend integration tests |

The project is organized as a client and server application in one repository. See [Architecture](docs/architecture.md).

## Getting started

Exact scripts and environment variable names can evolve. Use the current `package.json` files and the environment examples in [Development setup](docs/development.md) as the source of truth.

At a high level:

1. Install the dependencies for the client and server.
2. Create local environment files from the project's expected variables.
3. Start a local PostgreSQL database.
4. Apply Prisma migrations.
5. Start the API server and Vite development server.
6. Open the local frontend and register an account.

Do not commit `.env` files or real credentials. See [Development setup](docs/development.md).

## Security notes

Hibi stores personal writing, so privacy and data safety are core product requirements.

- API reads and mutations for journal and habit data are scoped to the authenticated user.
- Passwords are hashed using Argon2id.
- Session tokens are generated randomly; token hashes, rather than raw tokens, are stored in the database.
- The session cookie is configured as `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Production CORS, HTTPS, environment variables, backups, and deployment behavior still need to be reviewed and verified before inviting beta users.

See [Security and privacy](docs/security.md).

## Roadmap

### Planned
- Production deployment and configuration review.
- Invite-only private beta using unique, single-use invitation codes.
- Operational backup and restore procedures.
- Hibi Explore: suggest related journal entries and let users accept, reject, or manually create relationships.
- Book compilation: allow users to collect selected entries into a meaningful, searchable collection.

Planned features are not represented as implemented functionality. See [Roadmap and status](docs/roadmap.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Development setup](docs/development.md)
- [Security and privacy](docs/security.md)
- [Roadmap and status](docs/roadmap.md)

## Project philosophy

Hibi should help users reflect without making them feel judged or overwhelmed. Habit tracking should support consistency, while journaling remains a personal space. Future AI features should assist discovery and organization while leaving users in control of their writing and the relationships they choose to keep.
