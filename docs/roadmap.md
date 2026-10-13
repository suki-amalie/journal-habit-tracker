# Roadmap and feature status

This page distinguishes implemented functionality from planned product direction. Update it when a feature is completed and tested.

## Implemented and tested locally

### Journaling
- Create and manage journal entries.
- Browse journal history in a notebook-style view.
- Group short entries and paginate longer entries in the notebook presentation.
- Recover drafts for new entries and edits to existing entries using browser `localStorage`.
- Activity heatmap navigation to dates with writing.

### Habit tracking
- Create, edit, archive, and delete habits.
- Record habit completions.
- Review completion activity through heatmaps.
- Reject future-dated completions.
- Scope habits and completion records to the authenticated user.

### Authentication
- Register and log in.
- Hash passwords with Argon2id.
- Create and validate server-side sessions.
- Store hashes of session tokens in the database.
- Log out and invalidate the session.
- Reject missing, invalid, expired, and previously revoked session tokens.
- Protect journal and habit endpoints.
- Clear the frontend query cache and redirect to login when a protected API request returns `401`.

### Quality checks
- Backend integration tests cover session behavior and cross-user isolation.
- Client lint/build/tests and server type-check have been used as project checks.

These statements reflect the established project context; confirm against the current repository and CI before treating them as an up-to-date release checklist.

## In progress / next

1. **Production configuration review**
   - Environment variables and secret handling.
   - Production PostgreSQL URL and Prisma migration process.
   - CORS and cookie behavior across deployed domains.
   - Frontend API URL.
2. **Deploy a private test environment**
   - Candidate hosting: Vercel frontend, Render API, Neon PostgreSQL.
   - Free tiers may have limits, cold starts, or changing terms.
3. **Invite-only registration**
   - Unique, single-use invitation codes.
   - Secure generation and hashed storage.
   - Expiration and atomic redemption.
   - No public registration bypass.
4. **Operational readiness**
   - Database backup and tested restore.
   - Production smoke tests and error monitoring.
   - Clear beta feedback and data-handling expectations.

## Planned product direction

### Hibi Explore
Suggest potentially related journal entries so users can rediscover themes and connections in their writing. Candidate approach: embeddings and vector similarity, followed by ranking and user feedback. Model, storage, and evaluation strategy remain undecided.

### Books / collections
Allow users to collect selected journal pages into a book. Users should be able to search for entries, accept or reject suggested relationships, and add relationships manually. AI suggestions should not silently decide the user's personal narrative.

### Private beta and later growth
Start with a small group of invited testers. Use feedback to improve the journaling experience and habit workflows before opening registration more broadly.

## Non-goals for the first beta

- Public, unrestricted registration.
- Complex microservice architecture.
- AI features that automatically reorganize a user's journal without their control.
- Paid infrastructure upgrades before usage or reliability needs justify them.
