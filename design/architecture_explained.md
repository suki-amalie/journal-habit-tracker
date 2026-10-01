# Hibi Notes Architecture Explained

This document explains how the major parts of Hibi Notes fit together and why they are separated this way.

The goal is to keep the architecture simple while giving each part of the application a clear responsibility.

For implementation details, see:

* [FRONTEND_EXPLAINED.md](./FRONTEND_EXPLAINED.md) — React frontend structure
* [BACKEND_EXPLAINED.md](./BACKEND_EXPLAINED.md) — Express, validation, Prisma, and database structure

---

## 1. The Big Picture

Hibi Notes is split into three main layers:

```text
Hibi Notes
│
├── Client
│   └── React frontend
│
├── Server
│   └── Express API
│
└── Database
    └── PostgreSQL
```

The frontend is responsible for the user experience.

The backend is responsible for application behavior and data access.

The database is responsible for persistent data and data integrity.

The overall flow is:

```text
User
  ↓
React frontend
  ↓
HTTP API
  ↓
Express backend
  ↓
Prisma
  ↓
PostgreSQL
```

Responses travel back in the opposite direction.

---

# 2. Client–Server Boundary

The most important architectural boundary is between the client and server.

### Client

The client handles things that belong to the user's current session and interface:

* displaying pages
* handling user interactions
* managing React state
* showing loading and error states
* rendering habits and journal entries
* communicating with the API

### Server

The server handles things that should be trusted independently of the client:

* validating requests
* applying application rules
* creating and modifying data
* retrieving persistent data
* enforcing API behavior

The client therefore does not directly access PostgreSQL.

```text
React
  │
  │ HTTP
  ↓
Express
  │
  ↓
Prisma
  │
  ↓
PostgreSQL
```

This also means the server cannot assume that requests came from the Hibi Notes interface. Requests must still be validated on the server.

---

# 3. Frontend Structure

The frontend follows a simple flow:

```text
Page
  ↓
Hook
  ↓
Service
  ↓
API Client
  ↓
HTTP API
```

Each part has a different responsibility.

```text
Page       → What should this screen contain?

Hook       → How should React manage this data?

Service    → How should the frontend communicate with the API?

Component  → How should this part of the UI look and behave?

Utility    → What reusable calculation or transformation is needed?
```

For example:

```text
Dashboard
    ↓
useHabits()
    ↓
getHabits()
    ↓
apiClient()
    ↓
GET /api/habits
```

The details of these frontend layers are documented in [FRONTEND_EXPLAINED.md](./FRONTEND_EXPLAINED.md).

---

# 4. Backend Structure

The backend intentionally uses a small number of layers:

```text
Route
  ↓
Controller
  ↓
Prisma
  ↓
PostgreSQL
```

Routes connect HTTP endpoints to controllers.

Controllers handle request validation, application rules, and database operations.

Prisma provides the database access layer.

PostgreSQL stores the persistent data.

There is currently no separate backend service or repository layer because the application does not need that additional abstraction yet.

More detail is documented in [BACKEND_EXPLAINED.md](./BACKEND_EXPLAINED.md).

---

# 5. The Database Is the Source of Truth

The frontend displays the current state of the application, but it is not the permanent source of truth.

Persistent state lives in PostgreSQL.

For example, when a habit is completed:

```text
User clicks habit
      ↓
Frontend sends request
      ↓
Backend validates request
      ↓
PostgreSQL stores completion
      ↓
Frontend reflects the new state
```

The green ink drop shown in the interface is therefore a representation of a stored completion, rather than the completion itself.

The same principle applies to journal entries.

The journal editor displays and modifies the entry, but the persisted Markdown content belongs to the database.

---

# 6. Main Application Domains

Hibi Notes currently has two main domains:

```text
Hibi Notes
│
├── Habits
│   ├── Habit
│   ├── HabitCompletion
│   └── Yearly habit heatmap
│
└── Journal
    ├── JournalEntry
    └── Yearly journal board
```

They are intentionally related conceptually but remain separate in the data model.

### Habits

The habit system records **what I did**.

A habit can have many completion records:

```text
Habit
  │
  └── HabitCompletion
       ├── 2026-09-21
       ├── 2026-09-22
       └── 2026-09-24
```

The yearly heatmap visualizes these records.

### Journal

The journal records **what I thought**.

Each calendar date can have one journal entry:

```text
JournalEntry
    │
    ├── 2026-09-21
    ├── 2026-09-24
    └── 2026-09-26
```

The yearly board visualizes which dates contain entries.

This gives the two features different meanings:

```text
Green → Act
Blue  → Reflect
```

---

# 7. One Feature, One Data Flow

Although the application contains different features, they follow the same general architecture.

For example:

```text
User interaction
      ↓
Frontend state
      ↓
API request
      ↓
Backend logic
      ↓
Database
```

A habit completion and a journal entry therefore use the same architectural pattern even though their data and UI are different.

This consistency makes new features easier to reason about.

---

# 8. Data Ownership

A useful way to decide where code belongs is to ask:

> Who should own this responsibility?

### UI responsibility

If it is about how something looks or behaves locally, it belongs in the frontend.

Examples:

* modal visibility
* form input
* selected date
* visual state

### Application responsibility

If it is a rule about what the application allows, it belongs on the backend.

Examples:

* rejecting invalid requests
* preventing future habit completions
* deciding whether a journal date already exists

### Persistence responsibility

If it is a rule that must always hold for stored data, it belongs in the database where appropriate.

Examples:

* one journal entry per date
* one habit completion per habit/date

This gives a simple hierarchy:

```text
Frontend
  → User experience

Backend
  → Application behavior

Database
  → Persistent state and integrity
```

---

# 9. Why the Architecture Is Deliberately Simple

Hibi Notes is a personal application, so the architecture should not become complicated just to look sophisticated.

The current structure avoids abstractions such as:

* backend service layers
* repository layers
* Redux
* React Query
* microservices
* event-driven architecture

These can be useful when a project becomes large enough to benefit from them.

For Hibi Notes, the simpler structure is easier to understand:

```text
Frontend
Page → Hook → Service → API Client

Backend
Route → Controller → Prisma → Database
```

The architecture should grow when the application's problems grow.

---

# 10. Adding a New Feature

When implementing a new feature, work through the application from the user's perspective toward the database.

### Step 1 — Interface

Ask:

> What does the user need to see or interact with?

This determines the page and components.

### Step 2 — React state

Ask:

> Does this feature need data fetching or shared React state?

If so, this usually belongs in a hook.

### Step 3 — API

Ask:

> What operation does the frontend need from the server?

This determines the service function and API endpoint.

### Step 4 — Backend behavior

Ask:

> What should the server validate and what rules should it enforce?

This determines the controller logic.

### Step 5 — Persistence

Ask:

> What data needs to be stored, and what constraints should always hold?

This determines the database model and constraints.

The resulting path is:

```text
UI
 ↓
React logic
 ↓
API
 ↓
Backend logic
 ↓
Database
```

---

# 11. When Should the Architecture Change?

The architecture should evolve when there is a concrete reason to introduce more structure.

For example, an additional abstraction may become useful if:

* multiple controllers share complicated business logic
* database operations become difficult to manage
* many parts of the application need the same server state
* authentication introduces cross-cutting concerns
* the application grows into several large domains

Until then, keeping the existing boundaries simple is preferable.

The guiding principle is:

> **Add abstraction when it solves a real problem, not because the project could theoretically use it.**

---

# 12. Architecture Mental Model

The entire application can be reduced to this:

```text
                    Hibi Notes
                        │
          ┌─────────────┴─────────────┐
          ↓                           ↓
      Dashboard                    Journal
          │                           │
          └─────────────┬─────────────┘
                        ↓
                 React Frontend
                        │
                        ↓
                   HTTP API
                        │
                        ↓
                Express Backend
                        │
                        ↓
                     Prisma
                        │
                        ↓
                  PostgreSQL
```

The frontend focuses on **experience**.

The backend focuses on **application behavior**.

The database focuses on **persistent data and integrity**.

The specialized documents explain how each side implements these responsibilities.

---

## Core Principle

> **Keep responsibilities clear, keep boundaries simple, and add complexity only when the application actually needs it.**
