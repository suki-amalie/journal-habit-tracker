# Backend Explained

A practical guide to how the Hibi Notes backend is organized, how an HTTP request travels through the application, and why each backend layer exists.

This document is intended as a learning/reference guide. `ARCHITECTURE.md` describes the structure of the application; this document explains the reasoning behind that structure.

---

# 1. The Big Picture

The Hibi Notes backend sits between the React client and PostgreSQL.

```text
React client
     │
     │ HTTP / JSON
     ▼
Express API
     │
     ├── Routes
     │
     └── Controllers
             │
             ▼
        Prisma Client
             │
             ▼
        PostgreSQL
```

The main request flow is:

```text
HTTP request
    ↓
Route
    ↓
Controller
    ↓
Validate request with Zod
    ↓
Prisma query
    ↓
PostgreSQL
    ↓
Prisma result
    ↓
JSON response
    ↓
React client
```

The backend has deliberately been kept small.

There is currently no:

* service layer
* repository layer
* authentication layer
* global error-handling layer

Those could be introduced later if the application actually needs them.

For now, the main principle is:

> **Route → Controller → Prisma → Database**

---

# 2. Routes

Routes define **which HTTP request should call which controller**.

For example:

```text
server/src/routes/habitRoutes.ts
```

might contain:

```ts
router.get("/", getHabits);
router.post("/", createHabit);

router.post("/:id/completions", createHabitCompletion);
router.get("/:id/completions", getHabitCompletions);
router.delete("/:id/completions/:date", deleteHabitCompletion);
```

The routes don't contain the actual business logic.

They answer:

> "When this HTTP request arrives, which function should handle it?"

For example:

```text
GET /api/habits
        ↓
getHabits()

POST /api/habits
        ↓
createHabit()

POST /api/habits/3/completions
        ↓
createHabitCompletion()
```

The router is essentially the backend's **URL-to-function mapping**.

### Mental model

> **Route = HTTP wiring**

---

# 3. Controllers

Controllers contain the logic for handling a request.

For example:

```text
server/src/controllers/habitController.ts
server/src/controllers/journalController.ts
```

A controller generally does four things:

```text
1. Read request data
2. Validate it
3. Perform the database operation
4. Send an HTTP response
```

For example:

```text
POST /api/habits
        ↓
createHabit()
        │
        ├── read req.body
        ├── validate with Zod
        ├── prisma.habit.create(...)
        └── res.status(201).json(...)
```

The controller is therefore where the HTTP layer and database layer meet.

### Mental model

> **Controller = handle one API operation**

---

# 4. Why There Is No Service Layer

A larger backend might look like:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
Database
```

Hibi Notes intentionally does not do this.

Instead:

```text
Route
  ↓
Controller
  ↓
Prisma
  ↓
Database
```

For the current application, controllers are small enough that introducing additional layers would mostly mean moving a few lines of code between files.

For example, this:

```ts
const habit = await prisma.habit.create({
  data: {
    name,
    description,
  },
});
```

does not become more useful just because it is moved into:

```text
habitService.createHabit()
```

The simpler architecture is easier to follow.

If a controller eventually contains genuinely complicated business logic, that logic can be extracted into a plain function.

The architecture should grow because complexity requires it, not because a particular folder structure is considered "more professional."

---

# 5. Request Validation with Zod

Before using data from an HTTP request, the backend needs to establish that the data has the expected shape.

This is where Zod is used.

```text
HTTP request
     ↓
Zod validation
     ↓
Controller logic
```

The schemas are defined in:

```text
server/src/validation/schemas.ts
```

For example:

```ts
export const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Habit name is required")
    .max(HABIT_NAME_MAX_LENGTH),

  description: z
    .string()
    .trim()
    .max(HABIT_DESCRIPTION_MAX_LENGTH)
    .nullable()
    .optional(),
});
```

This says that a habit creation request must contain:

```text
name:
    string
    trimmed
    at least 1 character
    at most 100 characters

description:
    string, null, or omitted
    at most 500 characters
```

The controller can therefore reject invalid input before sending anything to Prisma.

---

# 6. Why Validate on the Server?

The React client already has TypeScript types and form validation.

However, client-side validation is not enough.

The backend must assume that requests can come from anywhere.

For example, someone could manually send:

```http
POST /api/habits
```

without using the React application at all.

The server therefore needs its own validation boundary:

```text
Browser UI
   ↓
client-side validation
   ↓
HTTP
   ↓
server-side validation ← must not trust the client
   ↓
database
```

This is an important general backend principle:

> **The client can help the user, but the server must enforce the rules.**

---

# 7. Length Limits

The schemas also define maximum text lengths.

```ts
export const HABIT_NAME_MAX_LENGTH = 100;

export const HABIT_DESCRIPTION_MAX_LENGTH = 500;

export const JOURNAL_CONTENT_MAX_LENGTH = 20_000;
```

These limits serve several purposes.

They prevent accidental huge requests:

```text
"Oops, I pasted an entire book into my habit description."
```

They also make the application's data model explicit.

For example:

```text
Habit name
    → maximum 100 characters

Habit description
    → maximum 500 characters

Journal content
    → maximum 20,000 characters
```

These are application-level constraints rather than arbitrary database implementation details.

---

# 8. Dates Are Validated as Strings

The application represents date-only values as:

```text
YYYY-MM-DD
```

The shared schema is:

```ts
export const dateStringSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Date must be in YYYY-MM-DD format"
  );
```

This checks the **format**.

For example:

```text
2026-09-29  ✓
2026-1-9    ✗
29-09-2026  ✗
hello       ✗
```

It is important to understand that this regex checks the format, not whether the date actually exists.

For example:

```text
2026-99-99
```

has the correct shape but isn't a real calendar date.

If the backend needs strict calendar-date validation, the controller can perform an additional check after the schema validation.

---

# 9. Habit Completion Query

The backend also accepts optional date ranges:

```ts
export const habitCompletionsQuerySchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});
```

This allows requests such as:

```text
GET /api/habits/completions
```

or:

```text
GET /api/habits/completions?from=2026-01-01&to=2026-12-31
```

The reason for this endpoint is the yearly habit heatmap.

Instead of necessarily fetching every habit's entire history separately, the client can eventually ask:

> "Give me the completions in this date range."

This is particularly useful when rendering a year of data.

The important point is that this endpoint is introduced because the **heatmap has a date-range data requirement**, not because every application must have a batch endpoint.

---

# 10. Journal Validation

Journal creation uses:

```ts
export const createJournalEntrySchema = z.object({
  date: dateStringSchema,
  content: z
    .string()
    .trim()
    .min(1, "Content cannot be empty")
    .max(JOURNAL_CONTENT_MAX_LENGTH),
});
```

This establishes the rules:

```text
date
    → YYYY-MM-DD

content
    → string
    → cannot be empty
    → maximum 20,000 characters
```

Updating an entry doesn't need another date because the date is already part of the URL:

```text
PUT /api/journal/2026-09-29
```

Therefore the update schema only needs:

```ts
export const updateJournalEntrySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content cannot be empty")
    .max(JOURNAL_CONTENT_MAX_LENGTH),
});
```

---

# 11. `formatZodError`

Zod can produce detailed validation errors.

The application doesn't necessarily want to expose all of that structure to the frontend.

So:

```ts
export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
```

turns the first validation issue into a short message.

For example, if the user submits:

```text
name = ""
```

the schema produces:

```text
Habit name is required
```

The controller can return something like:

```json
{
  "error": "Habit name is required"
}
```

This keeps the API's error format simple.

---

# 12. Prisma

Prisma is the backend's interface to PostgreSQL.

Instead of writing SQL manually:

```sql
SELECT *
FROM "Habit"
WHERE "archivedAt" IS NULL;
```

the controller can write:

```ts
const habits = await prisma.habit.findMany({
  where: {
    archivedAt: null,
  },
});
```

Prisma translates this into the appropriate database operation.

The flow is:

```text
Controller
    ↓
Prisma Client
    ↓
SQL/database operation
    ↓
PostgreSQL
```

Prisma also provides TypeScript types based on the database schema.

---

# 13. Prisma Schema

The database structure is defined in:

```text
server/prisma/schema.prisma
```

Hibi Notes currently has three main models.

```text
Habit
HabitCompletion
JournalEntry
```

Conceptually:

```text
Habit
 │
 │ one-to-many
 ▼
HabitCompletion
```

and independently:

```text
JournalEntry
```

---

## Habit

A `Habit` represents the definition of a habit.

For example:

```text
id: 1
name: "Read"
description: "Read for at least 20 minutes"
createdAt: ...
archivedAt: null
```

`archivedAt` allows a habit to be **soft-deleted**.

Instead of physically removing the row:

```text
DELETE FROM Habit
```

the application can set:

```text
archivedAt = some date
```

The habit then disappears from the active list while its historical data remains available.

---

# 14. HabitCompletion

A `HabitCompletion` represents one completed habit on one calendar date.

For example:

```text
habitId: 1
date: 2026-09-29
```

The schema has:

```text
unique(habitId, date)
```

This means a habit cannot accidentally have two completion records for the same day.

Conceptually:

```text
Habit "Read"

2026-09-27  ✓
2026-09-28  -
2026-09-29  ✓
```

The database represents the completed dates as rows.

---

# 15. Why Put Uniqueness in the Database?

The application can check:

```text
"Is this habit already completed today?"
```

before creating a completion.

But that alone isn't enough.

Imagine two requests arrive almost simultaneously:

```text
Request A → check → not completed
Request B → check → not completed

Request A → create
Request B → create
```

Without a database constraint, duplicates could potentially appear.

The unique constraint makes the database itself enforce:

```text
one habit + one date = at most one completion
```

This is an example of an important principle:

> **Application validation and database constraints protect different boundaries.**

Zod validates the request.

PostgreSQL enforces data integrity.

---

# 16. JournalEntry

A journal entry represents one day's reflection.

```text
JournalEntry
    date
    content
    createdAt
    updatedAt
```

The date is unique:

```text
date @unique
```

Therefore the data model directly expresses:

> One journal entry per calendar day.

For example:

```text
2026-09-27 → one entry
2026-09-28 → one entry
2026-09-29 → one entry
```

The content is stored as Markdown text rather than rendered HTML.

That means the database stores something like:

```md
# Today

I finally understood the Fenwick tree idea.

**It actually makes sense now.**
```

rather than storing generated HTML.

The React client can later render the Markdown.

---

# 17. Prisma Migrations

The Prisma schema describes what the database **should look like**.

The actual PostgreSQL database is changed through migrations.

For example, after adding `JournalEntry`:

```bash
npx prisma migrate dev --name add_journal_entries
```

This creates a migration describing the schema change.

The normal flow is:

```text
Edit schema.prisma
       ↓
prisma migrate dev
       ↓
Migration created
       ↓
PostgreSQL updated
       ↓
Prisma Client updated
```

Database tables should not be manually edited for normal development.

This keeps the schema changes reproducible.

---

# 18. HTTP Status Codes

Controllers also communicate the result of an operation through HTTP status codes.

Common examples in Hibi Notes:

```text
200 OK
    Successful GET/update

201 Created
    Resource was successfully created

204 No Content
    Successful deletion with no response body

400 Bad Request
    Request data is invalid

404 Not Found
    Requested resource doesn't exist

409 Conflict
    Request conflicts with existing data

500 Internal Server Error
    Unexpected server-side failure
```

For example:

```text
POST /api/habits
        ↓
valid request
        ↓
201 Created
```

But:

```text
POST /api/habits
name = ""
        ↓
400 Bad Request
```

And:

```text
POST /api/habits/1/completions
same date twice
        ↓
409 Conflict
```

The status code tells the client **what kind of result occurred**, while the JSON body can provide a human-readable explanation.

---

# 19. Error Handling

At the current scale, each controller handles its own errors.

Conceptually:

```ts
try {
  // validate
  // database operation
  // response
} catch (error) {
  console.error(error);

  res.status(500).json({
    error: "Something went wrong",
  });
}
```

This is intentionally simple.

There is currently no global error-handling middleware.

If the application grows and many controllers start repeating complicated error handling, that would be a reasonable point to introduce centralized error handling.

For now, keeping the behavior close to the operation makes the code easy to follow.

---

# 20. The Complete Example

Consider:

```text
POST /api/habits
```

with:

```json
{
  "name": "Read",
  "description": "Read for 20 minutes"
}
```

The request travels through the backend like this:

```text
1. Express receives the request

        ↓

2. habitRoutes.ts matches:

   POST /

        ↓

3. createHabit() controller runs

        ↓

4. Controller validates req.body with Zod

        ↓

5. Valid data is passed to Prisma

        ↓

6. Prisma inserts a Habit row

        ↓

7. PostgreSQL stores the row

        ↓

8. Prisma returns the created Habit

        ↓

9. Controller sends:

   201 Created
   { ...habit }

        ↓

10. React receives the JSON response
```

The backend's job is essentially to make that journey reliable and enforce the rules along the way.

---

# 21. Backend vs Database Rules

There are several different kinds of rules in Hibi Notes.

It's useful to understand where each one belongs.

### Request shape

Handled by Zod:

```text
name must be a string
content must be a string
date must have YYYY-MM-DD format
```

### Application rules

Handled by controllers:

```text
cannot complete a future date
cannot update a missing journal entry
archived habits shouldn't appear in active lists
```

### Data integrity

Handled by PostgreSQL/Prisma schema:

```text
habit ID is unique
journal date is unique
habit + completion date is unique
foreign keys must reference existing habits
```

So the architecture is not relying on one layer to do everything.

```text
Zod
  → Is the request shaped correctly?

Controller
  → Is the operation allowed?

Database
  → Is the stored data consistent?
```

---

# 22. Where Should New Backend Code Go?

When adding a feature, ask what kind of thing you're adding.

### "I need a new API endpoint."

→ `routes/`

```text
routes/tagRoutes.ts
```

### "I need to implement what that endpoint does."

→ `controllers/`

```text
controllers/tagController.ts
```

### "I need to validate request data."

→ `validation/schemas.ts`

### "I need a new table or relationship."

→ `prisma/schema.prisma`

Then create a migration.

### "I need to perform a database operation."

→ Usually directly in the relevant controller.

### "This calculation/business rule has become complicated."

→ Consider extracting a plain function.

Don't immediately create:

```text
services/
repositories/
managers/
factories/
```

unless the complexity actually justifies them.

---

# 23. The Backend Mental Model

The most useful mental model for Hibi Notes is:

```text
                     HTTP
                      │
                      ▼
                  ┌───────┐
                  │ Routes│
                  └───┬───┘
                      │
                      ▼
               ┌────────────┐
               │ Controllers│
               └─────┬──────┘
                     │
              validate with
                  Zod
                     │
                     ▼
               ┌──────────┐
               │  Prisma  │
               └────┬─────┘
                    │
                    ▼
              PostgreSQL
```

And each part has a simple job:

```text
Route
→ Which function handles this request?

Controller
→ What should happen?

Zod
→ Is the input valid?

Prisma
→ How do I talk to the database?

PostgreSQL
→ How do I store the data reliably?
```

That is the backend architecture.

---

# 24. The Core Principle

The backend isn't divided into files just for organization.

Each layer exists because it has a different responsibility:

```text
Routes
→ HTTP wiring

Controllers
→ request/response logic

Zod
→ input validation

Prisma
→ database access

PostgreSQL
→ persistent data + integrity
```

The goal is not to create as many layers as possible.

The goal is to make it clear **where a particular piece of logic belongs**.

For Hibi Notes, the current architecture is deliberately small:

```text
Route
  ↓
Controller
  ↓
Prisma
  ↓
PostgreSQL
```

with Zod sitting at the request boundary.

That is enough structure for the application's current complexity.
