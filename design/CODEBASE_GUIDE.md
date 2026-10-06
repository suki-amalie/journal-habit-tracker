# Codebase guide for beginners

This guide explains how Journal Habit Tracker works, assuming you have never used React, Express, Prisma or PostgreSQL. Read it top to bottom once, then use it as a map.

## 1. The big picture

The app has three parts that run separately and talk to each other:

```text
 Browser (client/)            Server (server/)              Database
 React app you see     --->   Express API (Node.js)  --->   PostgreSQL
 buttons, pages        <---   reads/writes data      <---   stores rows
        HTTP + JSON                  Prisma
```

- **Client** (`client/`): what you see in the browser. Built with **React** (UI components) and **Vite** (dev server and bundler). Styled with **Tailwind CSS**.
- **Server** (`server/`): a small program that exposes an **API**. The client sends it requests such as "give me today's journal entries" and it answers with **JSON** (text data). Built with **Node.js** and **Express**.
- **Database**: **PostgreSQL** stores data permanently. The server talks to it through **Prisma**, a library that turns JavaScript calls into SQL.

Why a separate server? The browser can't (and must not) talk to the database directly. The server is the gatekeeper that validates every request.

## 2. The tech stack in one paragraph each

- **TypeScript**: JavaScript plus types (`habitId: number`). The editor and compiler catch mistakes before you run the code. Files end in `.ts` or `.tsx`.
- **React**: you build the screen from **components**, which are functions that return markup (JSX). When **state** changes, React re-renders the component.
- **React Router**: shows a different page for each URL (`/habits`, `/journal/write`) without reloading the browser.
- **TanStack Query**: fetches data from the API, caches it, and refreshes it when you change something. It removes the need to hand-write "loading / error / refetch" code.
- **Express**: you register **routes** like "when a `GET` request arrives at `/api/habits`, run this function".
- **Zod**: describes what valid input looks like (for example, a name must be 1 to 100 characters) and rejects everything else.
- **Prisma**: you describe tables in `server/prisma/schema.prisma`; Prisma generates a typed client (`prisma.habit.findMany()`) and manages **migrations** (versioned changes to the database structure).
- **Vitest + Supertest**: test runners. Vitest runs unit tests; Supertest sends fake HTTP requests to the Express app.

## 3. Folder map

```text
journal-habit-tracker/
├── client/src/
│   ├── main.tsx              Entry point: mounts React, sets up TanStack Query
│   ├── App.tsx               Defines the URL -> page mapping (routes)
│   ├── layouts/              Shared page frames (header + <Outlet/>, journal tabs)
│   ├── pages/                One file per screen (Dashboard, Habits, Journal, JournalHistory)
│   ├── components/           Reusable UI pieces (HabitRow, ActivityHeatmap, MarkdownEditor...)
│   ├── hooks/                Custom hooks: data fetching + actions, used by pages
│   ├── services/             Plain functions that call the API (fetch)
│   ├── utils/                Pure helper functions (dates, streaks) with tests
│   ├── types/                TypeScript shapes (Habit, JournalEntry...)
│   └── lib/queryClient.ts    TanStack Query configuration
└── server/
    ├── prisma/schema.prisma  Database tables
    ├── prisma/migrations/    History of database changes
    ├── src/index.ts          Starts the server (listen on a port)
    ├── src/app.ts            Builds the Express app (middleware + routes)
    ├── src/routes/           URL -> controller function
    ├── src/controllers/      The logic for each endpoint
    ├── src/validation/       Zod schemas for incoming data
    ├── src/lib/              Prisma client, error helpers
    └── tests/api.test.ts     API tests
```

## 4. The data model

Defined in `server/prisma/schema.prisma`:

| Table | Columns | Meaning |
|---|---|---|
| `Habit` | id, name, description, createdAt, archivedAt | Something you want to do regularly. `archivedAt` is null while active. |
| `HabitCompletion` | id, habitId, date | "Habit X was done on day Y". Unique per habit and date. Deleted with its habit. |
| `JournalEntry` | id, content, createdAt, updatedAt | One piece of writing (Markdown). Many per day are allowed. |

### Two ways of representing "a day" (important!)

- **Habit completions use a calendar date**: `"2026-10-06"`. A habit is either done on that day or not. The client sends the user's *local* date and the server stores it unchanged.
- **Journal entries use a timestamp**: `"2026-10-06T10:30:00+07:00"`, because you can write several times a day. To get "the entries of Oct 6", the client computes the local day's start and end (`getDayRange` in `utils/date.ts`) and asks for entries between them.

Archived vs deleted habits: **archiving** hides a habit but keeps its history and can be reversed (Habits page, Archived tab, "Restore"). **Deleting** is permanent and also removes its completions.

## 5. How data flows: a full walk-through

Let's follow one action: **you tick a habit checkbox on the Dashboard**.

1. **Component** (`components/TodayHabits.tsx`): the checkbox `onChange` calls `onToggle(habit)`.
2. **Page** (`pages/Dashboard.tsx`) passes `toggleHabit` from the hook `useHabitCompletions`.
3. **Hook** (`hooks/useHabitsCompletions.ts`): `toggleHabit` runs a TanStack Query *mutation*:
   - **Optimistic update**: it immediately edits the cached list so the checkbox ticks with no delay.
   - It calls the service function.
   - If the request fails, it **rolls back** to the previous cache and shows an error.
   - When finished, it refetches to make sure the UI matches the server.
4. **Service** (`services/habitService.ts`): `createHabitCompletion(habitId, date)` calls `apiClient("/habits/3/completions", { method: "POST", body: ... })`.
5. **apiClient** (`services/apiClient.ts`): a thin wrapper around `fetch` that prepends the API URL and throws an `ApiError` if the response isn't OK.
6. **HTTP** travels to the server: `POST http://localhost:3000/api/habits/3/completions` with body `{"date":"2026-10-06"}`.
7. **Express** (`server/src/app.ts`) routes `/api/habits` to `routes/habitRoutes.ts`, which maps `POST /:id/completions` to a controller function.
8. **Controller** (`controllers/habitController.ts`):
   - validates the id and body with the Zod schemas (`validation/schemas.ts`); bad input gets `400`;
   - checks the habit exists (`404`) and isn't archived (`409`);
   - calls Prisma: `prisma.habitCompletion.create(...)`; a duplicate gives `409`.
9. **Prisma** sends SQL to PostgreSQL, which stores the row.
10. The controller responds with JSON and status `201`. The response travels back; the hook refetches; React re-renders; the heatmap and streak update.

```text
checkbox -> page -> hook (optimistic) -> service -> apiClient -> fetch
   -> Express route -> controller -> Zod validation -> Prisma -> PostgreSQL
   <- JSON response <- ... <- hook refetch -> React re-renders
```

### Reading data

Reading is the same path without the optimistic step. `useQuery` calls the service when a component mounts, caches the result under a **query key** (for example `["journal","entries","2026-10-06"]`), and returns `data`, `isPending` and `isError`. When several components use the same key they share one request.

### Query keys and refreshing

| Key | Data |
|---|---|
| `["habits", status]` | Habit lists (`active`, `archived`, `all`) |
| `["completions", "recent"]` | Last 365 days of completions |
| `["completions", "year", 2025]` | Completions of one past year (heatmap navigation) |
| `["journal","entries",date]` | Entries of one local day |
| `["journal","activity",year]` | Timestamps used to color the journal heatmap |

After a mutation (add, edit, delete) the hook **invalidates** the related keys, which makes TanStack Query refetch them. That's how the History heatmap updates after you delete an entry on another page.

## 6. The client in more detail

### Pages and routes (`App.tsx`)

| URL | Page | What it does |
|---|---|---|
| `/` | `Dashboard` | Today's habits and journal, habit heatmap and journal heatmap |
| `/habits` | `Habits` | Active/Archived tabs, search, streaks, add/edit/archive/delete |
| `/journal/write` | `Journal` | Markdown editor with live preview, today's entries (edit/delete) |
| `/journal/history` | `JournalHistory` | Journal heatmap; click a day to read, edit or delete its entries |

`/journal` redirects to `/journal/write`. `/journal/history?date=2026-10-06` opens a specific day.

### Hooks (the "brain" of each page)

A **hook** is a function starting with `use` that holds state/logic for a component.

- `useHabits(status)`: list habits, `addHabit`, `editHabit` (also used to archive/restore), `removeHabit`.
- `useHabitCompletions(habits)`: completions grouped by habit, `completedHabitIds` for today, optimistic `toggleHabit`.
- `useJournalEntries(date)`: entries of a day plus `addEntry`, `editEntry`, `removeEntry`.
- `useJournalActivity(year)`: per-day entry counts for the heatmap.
- `useDraft(key)`: saves what you type in the editor to `localStorage` so a refresh doesn't lose it.

Rule of thumb: **components show things, hooks fetch and change things, services talk to the network.**

### Notable components

- `ActivityHeatmap`: the GitHub-style year grid. It only receives a `Map<date, count>` so both heatmaps reuse it.
- `MarkdownEditor` / `MarkdownContent`: editor with toolbar and live preview, and a safe Markdown renderer (raw HTML is not allowed).
- `JournalEntryCard`: one entry with inline Edit/Delete, shared by the Write and History pages.
- `HabitRow`: one habit with checkbox, streak and an expandable heatmap.

## 7. The server in more detail

- `index.ts` only starts listening. `app.ts` builds the app, so tests can import it without opening a port.
- **Routes** are thin: `router.get("/", listHabits)`.
- **Controllers** do the work and always follow the same shape: validate, query the database, respond, and `try/catch` unexpected errors into a `500`.
- **Status codes used**: `200` OK, `201` created, `204` deleted (no body), `400` invalid input, `404` not found, `409` conflict (duplicate or archived), `500` unexpected error.

### API reference

| Method and path | Purpose |
|---|---|
| `GET /api/habits?status=active\|archived\|all` | List habits |
| `POST /api/habits` | Create `{name, description?}` |
| `PATCH /api/habits/:id` | Update `{name?, description?, archived?}` |
| `DELETE /api/habits/:id` | Delete permanently (with completions) |
| `GET /api/habits/completions?from&to` | Completions, default last 366 days, max range 400 days |
| `GET /api/habits/:id/completions` | One habit's completions |
| `POST /api/habits/:id/completions` | Mark done `{date}` |
| `DELETE /api/habits/:id/completions/:date` | Unmark |
| `GET /api/journal?from&to` | Entries created in `[from, to)` (ISO timestamps, max 400 days) |
| `GET /api/journal/activity?from&to` | Just the timestamps, for heatmaps |
| `POST /api/journal` | Create `{content}` |
| `PUT /api/journal/:id` | Update `{content}` |
| `DELETE /api/journal/:id` | Delete |
| `GET /api/health` | Health check |

## 8. Running and testing

See the README for setup. Day to day:

```bash
cd server && npm run dev     # API on :3000
cd client && npm run dev     # app on :5173
cd server && npm test        # API tests
cd client && npm test        # helper tests
cd client && npm run lint && npm run build
```

Tests:
- `client/src/utils/*.test.ts`: pure date, streak and excerpt helpers.
- `server/tests/api.test.ts`: sends requests to the Express app with the database mocked, so no real PostgreSQL is needed.

## 9. Recipe: add a new feature end to end

Example: add a "mood" field to journal entries.

1. **Database**: add `mood String?` to `JournalEntry` in `schema.prisma`, run `npx prisma migrate dev --name add_mood`.
2. **Validation**: allow `mood` in the Zod schemas in `server/src/validation/schemas.ts`.
3. **Controller**: pass it to `prisma.journalEntry.create/update`.
4. **Test**: add a case in `server/tests/api.test.ts`.
5. **Client types**: add `mood` to `types/journal.ts`.
6. **Service and hook**: send it in `journalService.ts`; extend the hook if needed.
7. **UI**: add an input in the editor and display it in `JournalEntryCard`.
8. Run both test suites, `npm run lint` and `npm run build`.

## 10. Glossary

- **API**: a set of URLs a program can call to read or change data.
- **Endpoint**: one URL + HTTP method, like `POST /api/journal`.
- **JSON**: a text format for data, like `{"name":"Read"}`.
- **Component**: a function that returns part of the UI.
- **State**: data a component remembers; changing it re-renders the UI.
- **Hook**: a reusable function starting with `use` that adds state or effects.
- **Cache**: stored copy of server data so the UI doesn't wait for every request.
- **Optimistic update**: update the UI first, then confirm with the server, undo on failure.
- **Migration**: a versioned script that changes the database structure.
- **ORM**: a library (Prisma) that lets you use the database through code instead of SQL.
- **Middleware**: code that runs on every request before your routes (for example `express.json()` parses request bodies).
- **CORS**: a browser rule that lets the client at `:5173` call the server at `:3000` only if the server allows it (`CLIENT_URL`).
