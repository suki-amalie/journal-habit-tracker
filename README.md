# Journal Habit Tracker

A personal journaling app with a GitHub-style habit tracker. 
> **Current status:** Journal entries are not yet saved to the database by the client. The journal page currently keeps edits in page state, which is lost when you leave or reload the page.

## Tech stack

- **Client:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router
- **API:** Node.js, Express 5, TypeScript, Prisma ORM
- **Database:** PostgreSQL

## Project structure

```text
client/   React + Vite frontend
server/   Express API + Prisma schema and migrations
design/   UI and implementation notes
```

## Prerequisites

- Node.js 20 or later and npm
- PostgreSQL 14 or later
- Git

## Set up

### 1. Create a PostgreSQL database

Install PostgreSQL using the [official installer](https://www.postgresql.org/download/) for your platform, then create a database named `journal_tracker` (for example, through pgAdmin).

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
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/journal_tracker?schema=public"
```

Replace `your_password` with the password for your PostgreSQL user. If the password contains URL-reserved characters, percent-encode them in the connection URL.

The server also accepts these optional settings:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port used by the API server |
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

## Useful commands

Run client commands from `client/` and Prisma commands from `server/`.

| Command | Directory | Description |
|---|---|---|
| `npm run dev` | `client/` | Start the Vite development server |
| `npm run build` | `client/` | Type-check and build the client |
| `npm run lint` | `client/` | Lint the client |
| `npm run dev` | `server/` | Start the API with watch mode |
| `npx prisma migrate dev` | `server/` | Apply migrations and generate Prisma Client |
| `npx prisma studio` | `server/` | Open Prisma Studio to browse database records |

## Troubleshooting

- **Can't reach the database:** Make sure PostgreSQL is running, the `journal_tracker` database exists, and `DATABASE_URL` has the correct host, port, username, password, and database name.
- **Password authentication failed:** Verify the PostgreSQL credentials and that the user can access `journal_tracker`.
- **Prisma cannot find `DATABASE_URL`:** Check that `server/.env` exists and that the variable is spelled correctly.
- **Browser reports a CORS error:** Set `CLIENT_URL` in `server/.env` to the exact client origin, then restart the API server.
- **Port already in use:** Change `PORT` for the API or use Vite's printed port for the client. If you change the API port, set `VITE_API_URL` in `client/.env` to match and restart both development servers.
