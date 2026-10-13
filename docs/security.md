# Security and privacy

Hibi is designed to hold personal journal entries. Security, privacy, and recoverability should be treated as core product requirements.

This document records current protections and work that must be completed or verified before the private beta. It is not a security certification.

## Implemented protections

### Passwords
- Passwords are hashed with Argon2id before being stored.
- Login returns a generic invalid-email-or-password response rather than revealing which credential was incorrect.
- Registration validates input using Zod and normalizes email addresses to lowercase.

### Sessions
- The server generates a random session token.
- Only a SHA-256 hash of the token is stored in PostgreSQL.
- The browser receives the token in an `HttpOnly` cookie.
- The cookie uses `SameSite=Lax`, path `/`, and `Secure` in production.
- Sessions expire after seven days.
- Logout deletes the session and clears the cookie.
- Expired or invalid sessions are rejected by authentication middleware.

### Authorization and isolation
- Journal and habit operations are scoped to the authenticated user's ID on the server.
- Integration tests cover cross-user data isolation.
- Frontend route protection is a user-experience feature; server-side authentication and authorization remain the actual security boundary.

### Draft persistence
- Journal drafts are stored in browser `localStorage` to recover unfinished writing on the same browser and origin.
- Drafts are not currently synchronized to the server.
- `localStorage` is accessible to JavaScript running on the same origin. Avoid storing session tokens or other authentication secrets there.

## Before inviting beta users

Verify each item in the deployed environment:

- [ ] Production environment variables are set in the hosting provider and are not committed to Git.
- [ ] `NODE_ENV` is set correctly so production cookie security is enabled.
- [ ] HTTPS is enabled.
- [ ] CORS allows only the intended frontend origin and enables credentials only as required.
- [ ] The frontend API URL points to the production API, not localhost.
- [ ] Cookie behavior works across the chosen frontend and API domains.
- [ ] Production database access is restricted and uses appropriate connection settings.
- [ ] Backups are configured and a restore has been tested.
- [ ] Registration is invite-only before sharing the beta.
- [ ] Invalid invitation codes, expired codes, reused codes, and concurrent redemption are tested.
- [ ] Error responses do not leak secrets, session tokens, password hashes, or unnecessary personal data.
- [ ] Logs avoid recording passwords, raw session tokens, invitation codes, or journal content.
- [ ] Account deletion and data-retention expectations are documented before collecting real users' writing.

## Invitation-only registration (planned)

The private beta is intended to use unique, single-use invitation codes. The proposed design is:

- Generate codes using a cryptographically secure random generator on the server.
- Store only a hash of each code.
- Apply an expiry policy.
- Validate and consume the code atomically with account creation.
- Ensure the existing registration endpoint cannot bypass invitation validation.

This feature is planned and should not be described as implemented until it exists and has been tested.

## Privacy considerations for future AI features

Hibi Explore is planned to suggest relationships between journal entries. Before processing users' writing with an AI or embedding provider, clearly explain:

- What text is processed.
- Which service receives it and why.
- What data is retained by the provider, if any.
- Whether users can opt out or delete derived data.
- How embeddings and relationships are deleted when an entry or account is deleted.

Do not assume journal content is safe to send to a third party without making that processing clear to users.
