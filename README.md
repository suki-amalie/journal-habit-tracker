# Journal Habit Tracker

A personal journaling app with a GitHub-style habit tracker. Track daily habits with a contribution-style heatmap and keep a markdown journal, side by side.

## Tech Stack

- **Client**: React 19, TypeScript, Vite, Tailwind CSS, React Router
- **Server**: Node.js, Express 5, TypeScript, Prisma ORM
- **Database**: PostgreSQL

## Project Structure

```
client/   # React + Vite frontend
server/   # Express + Prisma backend API
```

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later (and npm)
- [PostgreSQL](https://www.postgresql.org/) v14 or later
- Git

---

## 1. Install PostgreSQL

### Windows

1. Download the installer from the [official PostgreSQL site](https://www.postgresql.org/download/windows/).
2. Run the installer and keep the default port (`5432`). Set and remember a password and username for the `postgres` superuser. This will later come in handy for setting up .env file in your server


### Create the database

Go to pgAdmin app and create a database called journal_tracker

---

## 2. Clone and install dependencies

```bash
git clone <repo-url>
cd journal-habit-tracker

# install server dependencies
cd server
npm install

# install client dependencies
cd ../client
npm install
```

---

## 3. Configure environment variables

The server reads its configuration from a `.env` file. Create `server/.env`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/journal_tracker"
```

Replace `your_password` with the `postgres` superuser password you set in step 1, and update the host/port/database name if yours differ.

> The client does not require a `.env` file. It talks to the API at `http://localhost:3000/api` by default (see `client/src/services/apiClient.ts`). If you change the server port, update that constant accordingly.

---

## 4. Set up the database schema

From the `server` directory, run Prisma's migrations to create the tables defined in `prisma/schema.prisma`:

```bash
cd server
npx prisma migrate dev
```

This applies all existing migrations and generates the Prisma Client. Re-run this command whenever new migrations are added to the repo.

---

## 5. Run the project

Open two terminals, one for the server and one for the client.

**Server** (from `server/`):
```bash
npm run dev
```
Runs on `http://localhost:3000` by default.

**Client** (from `client/`):
```bash
npm run dev
```
Runs on `http://localhost:5173` by default (Vite will print the exact URL).

Open the client URL in your browser to use the app.

---

## Useful commands

| Command | Location | Description |
|---|---|---|
| `npm run dev` | `server/` | Start the API server with hot reload |
| `npm run dev` | `client/` | Start the Vite dev server |
| `npm run build` | `client/` | Type-check and build the client for production |
| `npm run lint` | `client/` | Lint the client codebase |
| `npx prisma migrate dev` | `server/` | Apply database migrations |
| `npx prisma studio` | `server/` | Open a GUI to browse/edit database data |

## Troubleshooting

- **`Can't reach database server`**: confirm PostgreSQL is running and `DATABASE_URL` in `server/.env` matches your host/port/credentials.
- **`password authentication failed`**: double-check the username/password in `DATABASE_URL`, and that the user has privileges on the target database.
- **Port already in use**: another process may be using `3000` (server) or `5173` (client); stop it or change the port.
