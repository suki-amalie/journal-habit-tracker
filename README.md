# Journal Habit Tracker

A personal journaling app with a GitHub-style habit tracker: check off habits daily, write Markdown journal entries (as many as you like per day), and browse both as yearly heatmaps.

## Features

* **Dashboard:** today's habits and journal, plus habit and journal heatmaps. Click a habit day to see what you completed; click a journal day to open it in History.
* **Habits:** add, edit, archive and delete habits, with streaks and per-habit heatmaps.
* **Journal:** Markdown editor with live preview, draft autosave and Ctrl+Enter to save; History lists entries per day.

## Tech stack

* **Client:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query
* **API:** Node.js, Express 5, TypeScript, Prisma ORM, Zod
* **Database:** PostgreSQL
* **Tests:** Vitest, Testing Library, Supertest, PostgreSQL integration tests
* **CI:** GitHub Actions

## Project structure

```text
client/   React + Vite frontend
server/   Express API + Prisma schema, migrations and tests
design/   NEW_DESIGN.md and CODEBASE_GUIDE.md
```

New to this stack? Read the [codebase guide](design/CODEBASE_GUIDE.md) for a beginner-friendly tour and how data flows through the app. Frontend contributors should also read the [frontend guide](design/FRONTEND_GUIDE.md).

## Data model notes

* **Habit completions** are calendar days (`YYYY-MM-DD`, the user's local date). `GET /api/habits/completions` returns the last 366 days by default; pass `from`/`to` (max 400 days) for other periods.
* **Journal entries** are timestamps, so there can be many per day. The client asks for a local-day range with `GET /api/journal?from=&to=` (ISO timestamps with offset, `from` inclusive, `to` exclusive).
* Deleting a habit is permanent and removes its completions; archive it to keep the history.
* There is no authentication yet, so don't expose the API publicly.
* A habit can have at most one completion for a given date. This is enforced by the PostgreSQL unique constraint on `(habitId, date)`.

## Prerequisites

* Node.js 20 or later and npm
* PostgreSQL 14 or later
* Git

## Set up

### 1. Create a PostgreSQL database

Install PostgreSQL using the [official installer](https://www.postgresql.org/download/) for your platform, then create a database named `journal_tracker` (for example, through pgAdmin).

The `journal_tracker` database is the development database. A separate database is used for integration tests; see [Testing](#testing).

### 2. Clone the repository and install dependencies

```bash
git clone <repo-url>

cd journal-habit-tracker

cd server
npm install

cd ../client
npm install
```

### 3. Configure the server

Create `server/.env` with your PostgreSQL connection details:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/journal_tracker"
```

Replace `your_password` with the password for your PostgreSQL user. If the password contains URL-reserved characters, percent-encode them in the connection URL.

The server also accepts these optional settings:

| Variable     | Default                 | Purpose                       |
| ------------ | ----------------------- | ----------------------------- |
| `PORT`       | `3000`                  | Port used by the API server   |
| `CLIENT_URL` | `http://localhost:5173` | Client origin allowed by CORS |

### 4. Create the database schema

From the `server` directory, apply the checked-in migrations and generate the Prisma Client:

```bash
npx prisma migrate dev
```

Run this again after pulling changes that add new migrations.

### 5. Start the app

Open two terminals in the repository.

**API server** (terminal 1):

```bash
cd server
npm run dev
```

The API runs at `http://localhost:3000` by default. Its health endpoint is `http://localhost:3000/api/health`.

**Client** (terminal 2):

```bash
cd client
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

The client uses `http://localhost:3000/api` by default. To use another API URL, create `client/.env` and set:

```env
VITE_API_URL="http://localhost:3000/api"
```

## Testing

Hibi uses several levels of tests so that different parts of the application can be tested independently.

### Client tests

Client tests cover pure helper functions as well as React hooks and components.

From `client/`:

```bash
npm test
```

### Server API tests

The main server API suite uses Vitest and Supertest. Prisma is mocked in these tests.

This makes the tests fast and allows specific database errors such as Prisma `P2002` and `P2025` to be simulated.

From `server/`:

```bash
npm test
```

These tests verify API behaviour such as:

* request validation
* HTTP status codes
* controller behaviour
* error handling
* route behaviour

### PostgreSQL integration tests

The integration suite uses the **real PostgreSQL database**, rather than a mocked Prisma client.

The test flow is:

```text
Supertest
    ↓
Express
    ↓
Controllers
    ↓
Prisma
    ↓
PostgreSQL test database
```

The integration tests currently verify:

1. Creating a habit actually persists a row in PostgreSQL.
2. PostgreSQL rejects duplicate habit completions through the `(habitId, date)` unique constraint, producing Prisma `P2002` and an HTTP `409`.
3. Deleting a habit cascades to its completions through the database foreign-key relationship.

### Setting up the test database

Create a separate PostgreSQL database named:

```text
journal_tracker_test
```

Do not use the development database for integration tests.

Create `server/.env.test`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/journal_tracker_test"
```

Replace `your_password` with your PostgreSQL password.

The test database
