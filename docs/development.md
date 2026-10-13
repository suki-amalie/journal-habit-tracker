# Development setup

This guide describes the local development workflow at a high level. Check the current root, `client`, and `server` `package.json` files for the exact scripts; script names may change as the project evolves.

## Prerequisites

- Node.js (the project has been developed with Node.js 22).
- npm.
- PostgreSQL.
- Git.

## Repository layout

The repository contains separate client and server applications. The client is a React/Vite app; the server is an Express/TypeScript API that uses Prisma to access PostgreSQL.

```text
journal-habit-tracker/
├── client/
│   └── src/
├── server/
│   ├── prisma/
│   └── src/
└── README.md
```

This is a simplified illustration, not an exhaustive file tree.

## Environment variables

Create local environment files using the variable names expected by the current code. Do not copy production credentials into local files.

Typical configuration concepts include:

| Variable | Purpose | Secret? |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma | Yes |
| `PORT` | Local API listening port | Usually no |
| `NODE_ENV` | Runtime environment, such as development or production | No |
| `CLIENT_URL` or the current CORS origin variable | Allowed frontend origin | No |
| `VITE_API_URL` | API base URL bundled into the frontend | No; visible to browsers |

The exact backend CORS variable name must match the current server implementation. `VITE_` variables are compiled into frontend code and must never contain secrets.

Example local values (adjust names to match the implementation):

```dotenv
# server/.env — illustrative only
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/journal_tracker
```

```dotenv
# client/.env — illustrative only
VITE_API_URL=http://localhost:3000/api
```

Never commit `.env` files containing credentials. Keep test and development databases separate.

## Database and Prisma

1. Start PostgreSQL locally.
2. Create a development database.
3. Set `DATABASE_URL` to that database.
4. Apply committed migrations using the project's installed Prisma CLI and configured package scripts.
5. Regenerate the Prisma client if the project's workflow requires it.

For shared environments, use migrations rather than manually changing the schema. Do not run destructive database commands against production without a verified backup and a deliberate plan.

## Running the app

Use the current scripts in the client and server `package.json` files to start the API and Vite development server. Run them in separate terminals unless the repository provides a combined development script.

The API's health endpoint is currently `GET /api/health`; use it to help confirm that the backend is running.

## Tests and checks

Before merging changes, run the available checks defined in the repository:

- Client lint.
- Client production build.
- Client tests.
- Server type-check.
- Backend integration tests.

Authentication and data-isolation changes deserve explicit regression tests, including invalid credentials, logout, expired sessions, missing or invalid session cookies, and attempts to access another user's data.

## Troubleshooting

### Frontend cannot reach the API
- Confirm the API is running.
- Confirm `VITE_API_URL` points to the correct API base URL.
- Check browser network errors and CORS configuration.
- Restart Vite after changing environment variables.

### Login works but protected requests fail
- Confirm `fetch` requests include credentials.
- Confirm the API CORS configuration allows the exact frontend origin and credentials.
- Check cookie attributes, HTTPS, and browser cookie behavior.

### Prisma cannot connect
- Check that PostgreSQL is running.
- Verify the database name, host, port, username, password, and connection parameters in `DATABASE_URL`.
- Ensure migrations have been applied to the intended database.

### A draft does not restore
- Check browser Local Storage for the expected draft key.
- Confirm the browser is using the same origin and profile.
- Remember that browser storage can be unavailable, cleared, or limited.
