# Frontend Explained

A practical guide to how the Hibi Notes frontend is organized, what each layer is responsible for, and how data flows through the React application.

This document is intentionally more explanatory than `ARCHITECTURE.md`. It is meant to help understand the frontend while building the project, rather than serve as a strict specification.

---

## 1. The Big Picture

The Hibi Notes frontend follows this general flow:

```text
User interacts with UI
        ↓
      Page
        ↓
      Hook
        ↓
    Service
        ↓
   apiClient
        ↓
    HTTP request
        ↓
   Express API
        ↓
     Database
```

The response travels back in the opposite direction:

```text
Database
    ↓
Express controller
    ↓
HTTP response
    ↓
apiClient
    ↓
Service
    ↓
Hook
    ↓
Page
    ↓
React re-renders
    ↓
Component displays the new data
```

The important idea is that each layer has a different responsibility.

```text
Page       → What should this screen contain?
Hook       → How should React manage this data?
Service    → How do we communicate with the API?
Component  → How should this part of the UI look and behave?
Utility    → How do we perform a reusable calculation?
```

---

# 2. Pages

Pages represent the application's screens or routes.

```text
client/src/pages/

Dashboard.tsx
Journal.tsx
```

The router connects URLs to pages:

```text
/         → Dashboard
/journal  → Journal
```

A page's main responsibility is **composition**.

For example, the Dashboard might contain:

```text
Dashboard
├── Today's habits
├── Today's progress
├── Write today
└── Yearly habit heatmap
```

The page decides how these pieces fit together.

A page should generally **not** need to know how HTTP requests work.

For example, we don't want `Dashboard.tsx` to contain:

```tsx
fetch("http://localhost:3000/api/habits")
```

Instead, it asks a hook for the data:

```tsx
const habits = useHabits();
```

The page can then focus on putting the UI together.

### Mental model

> **Page = composition of a screen**

---

# 3. React Hooks

Hooks are the part of the architecture that manages **stateful React logic**.

This is one of the most important distinctions in the frontend.

Suppose `Dashboard.tsx` had to manage everything itself:

```tsx
const [habits, setHabits] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchHabits()
    .then(...)
    .catch(...);
}, []);
```

Then we also need logic for:

```text
Adding a habit
Loading completions
Toggling a completion
Handling errors
Refreshing data
```

The page would quickly become mostly data-management code.

Instead, that logic can live in a hook:

```text
Dashboard
    │
    │ useHabits()
    ↓
useHabits
    │
    ├── habits
    ├── loading
    ├── error
    └── addHabit()
```

The page can then think in terms of:

> "I have some habits, they're loading, and I can add one."

rather than:

> "I need to make a POST request, parse JSON, update state, and handle errors."

### Mental model

> **Hook = React state + data-fetching/mutation logic**

---

## 3.1 Hooks are not API services

It is useful to keep these two concepts separate.

### Service

A service answers:

> **How do I communicate with the backend?**

For example:

```text
habitService.ts

getHabits()
createHabit()
getHabitCompletions()
createHabitCompletion()
deleteHabitCompletion()
```

The service knows about:

```text
HTTP
URLs
methods
request bodies
JSON responses
```

### Hook

A hook answers:

> **How does this data behave inside React?**

It knows about:

```text
useState
useEffect
loading
errors
local state
when to fetch
when to update state
```

So:

```text
habitService.ts
      ↓
"How do I call the API?"

useHabits.ts
      ↓
"How does React manage the result?"
```

They solve different problems.

---

# 4. Example: Adding a Habit

Suppose the user enters:

```text
Read
```

into `AddHabitModal`.

The complete flow looks like:

```text
AddHabitModal
      │
      │ onSubmit("Read")
      ↓
Dashboard
      │
      │ addHabit("Read")
      ↓
useHabits
      │
      │ createHabit("Read")
      ↓
habitService
      │
      │ POST /api/habits
      ↓
apiClient
      │
      ↓
Express controller
      │
      ↓
Prisma
      │
      ↓
PostgreSQL
```

The response then comes back:

```text
PostgreSQL
    ↓
Prisma
    ↓
Controller
    ↓
JSON response
    ↓
apiClient
    ↓
habitService
    ↓
useHabits
    ↓
setHabits(...)
    ↓
React re-renders
    ↓
Dashboard
    ↓
"Read" appears
```

This separation means the modal doesn't need to know anything about PostgreSQL, Prisma, or HTTP.

---

# 5. Services

Services are intentionally thin.

```text
client/src/services/

apiClient.ts
habitService.ts
journalService.ts
```

A service represents the frontend's interface to a particular backend resource.

For example:

```text
habitService.ts

getHabits()
createHabit()
getHabitCompletions()
createHabitCompletion()
deleteHabitCompletion()
```

Each function corresponds to an API operation.

The service should not care about:

* React components
* buttons
* modals
* loading spinners
* UI state

It simply performs the network operation and returns the result.

### Mental model

> **Service = API operation**

---

# 6. `apiClient.ts`

`apiClient.ts` is the common HTTP layer.

Instead of every service doing:

```tsx
fetch(`${API_URL}/habits`)
```

and separately handling errors, everything goes through:

```text
apiClient()
```

Conceptually:

```text
habitService
journalService
       │
       ▼
   apiClient
       │
       ▼
     fetch
```

This gives the application one place to handle common HTTP behavior.

For example:

```text
VITE_API_URL
error handling
non-2xx responses
ApiError
```

This means if the API's error handling changes later, you don't need to rewrite every service.

### Mental model

> **apiClient = shared HTTP plumbing**

---

# 7. Components

Components are mostly responsible for **UI and interaction**.

Examples:

```text
client/src/components/

AppHeader.tsx
AddHabitModal.tsx
HabitList.tsx
HabitHeatmap.tsx
DailyEntry.tsx
InkDrops.tsx
```

A component should ideally not care where its data came from.

For example:

```tsx
<HabitList
  habits={habits}
  completions={completions}
  onToggle={toggleHabit}
/>
```

`HabitList` doesn't need to know whether the data came from:

* PostgreSQL
* an API
* localStorage
* a mock
* hardcoded test data

It just receives data and displays it.

This makes components easier to reason about and reuse.

### Mental model

> **Component = UI + local interaction**

---

# 8. Local Component State

Not all state belongs in a hook.

Components can still own small pieces of state that only make sense inside that component.

For example, `AddHabitModal` might own:

```text
name input
description input
form validation state
```

Similarly, `DailyEntry` might own:

```text
editing/not editing
draft Markdown
```

This is different from application data.

For example:

```text
DailyEntry

Local UI state:
    isEditing
    draftContent

Server data:
    JournalEntry
```

A useful rule is:

> If the state only exists to make one component work, keeping it inside the component is usually fine.

---

# 9. Hooks vs Component State

This distinction can be confusing.

Consider a journal editor.

### Local component state

```text
"Is the editor currently open?"
"What's currently typed in the textarea?"
```

These are UI concerns.

They can live inside `DailyEntry`.

### Server data

```text
"What journal entry exists for 2026-09-29?"
"Was it successfully saved?"
"Are we currently loading it?"
```

These are data-fetching concerns.

They belong in a hook.

So you might conceptually have:

```text
DailyEntry
│
├── local state
│   ├── isEditing
│   └── draft
│
└── hook
    ├── entry
    ├── loading
    ├── error
    └── saveEntry()
```

This keeps the responsibilities clear.

---

# 10. Utilities

Utilities contain reusable calculations that don't belong to a particular component or API resource.

For example:

```text
client/src/utils/

date.ts
```

`date.ts` doesn't know anything about:

```text
React
Express
Prisma
Dashboard
Journal
```

It simply performs date-related calculations.

### Mental model

> **Utility = reusable calculation/helper**

---

# 11. Date Utilities

Hibi Notes deals primarily with **calendar dates**, not precise timestamps.

A habit completion means:

```text
2026-09-29
```

rather than:

```text
2026-09-29 15:42:18 UTC
```

A journal entry similarly belongs to one calendar day.

This is why the application consistently represents date-only values as:

```text
YYYY-MM-DD
```

For example:

```text
2026-09-29
```

---

## 11.1 `getUserTimeZone`

```ts
export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

Returns the browser's local IANA timezone.

Examples:

```text
Asia/Ho_Chi_Minh
Australia/Melbourne
America/New_York
```

We use the browser's timezone rather than assuming the server's timezone.

This matters because the user might be in one timezone while the backend is running somewhere else.

---

## 11.2 `getTodayDate`

```ts
export function getTodayDate(): string {
  const timeZone = getUserTimeZone();

  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
```

Returns today's date for the user as:

```text
YYYY-MM-DD
```

For example:

```text
2026-09-29
```

The important detail is that `new Date()` represents the current moment, while the formatter converts that moment into the user's local calendar date.

This helps avoid off-by-one-day problems around midnight and across timezones.

---

## 11.3 `getDateString`

```ts
export function getDateString(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}
```

Converts separate date components into the standard application format.

```text
getDateString(2026, 9, 29)
        ↓
"2026-09-29"
```

The `padStart` calls make sure that:

```text
9
```

becomes:

```text
09
```

---

## 11.4 `isLeapYear`

```ts
export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
```

Determines whether a year contains 366 days.

The rule is:

```text
divisible by 4
        AND
(not divisible by 100 OR divisible by 400)
```

Examples:

```text
2024 → leap year
2025 → not leap year
1900 → not leap year
2000 → leap year
```

---

## 11.5 `getDaysInYear`

```ts
export function getDaysInYear(year: number): string[] {
  const daysInYear = isLeapYear(year) ? 366 : 365;

  const dates: string[] = [];

  for (let day = 0; day < daysInYear; day++) {
    const date = new Date(year, 0, day + 1);

    dates.push(
      getDateString(
        year,
        date.getMonth() + 1,
        date.getDate(),
      ),
    );
  }

  return dates;
}
```

Generates every calendar date in a year.

For example:

```text
getDaysInYear(2026)
```

produces:

```text
2026-01-01
2026-01-02
2026-01-03
...
2026-12-31
```

This is useful for the yearly habit and journal heatmaps.

The interesting part is:

```ts
new Date(year, 0, day + 1)
```

JavaScript automatically normalizes dates when the day exceeds the number of days in a month.

So instead of manually calculating:

```text
January → 31
February → 28
March → 31
...
```

we can simply keep advancing the date.

---

## 11.6 `getWeekday`

```ts
export function getWeekday(
  year: number,
  month: number,
  day: number,
): number {
  return new Date(year, month - 1, day).getDay();
}
```

Returns the weekday using JavaScript's numbering:

```text
Sunday    → 0
Monday    → 1
Tuesday   → 2
Wednesday → 3
Thursday  → 4
Friday    → 5
Saturday  → 6
```

Notice that JavaScript's month argument is zero-based, so:

```text
January → 0
February → 1
...
December → 11
```

That's why the function uses:

```ts
month - 1
```

The function itself accepts normal human month numbers:

```text
January = 1
```

rather than JavaScript's:

```text
January = 0
```

---

## 11.7 `getMondayFirstWeekday`

```ts
export function getMondayFirstWeekday(
  year: number,
  month: number,
  day: number,
): number {
  const sundayFirst = getWeekday(year, month, day);

  return (sundayFirst + 6) % 7;
}
```

Converts JavaScript's Sunday-first numbering into Monday-first numbering.

JavaScript:

```text
Sunday    0
Monday    1
Tuesday   2
...
Saturday  6
```

Heatmap:

```text
Monday    0
Tuesday   1
Wednesday 2
Thursday  3
Friday    4
Saturday  5
Sunday    6
```

For example:

```text
Monday:
(1 + 6) % 7 = 0

Tuesday:
(2 + 6) % 7 = 1

Sunday:
(0 + 6) % 7 = 6
```

This makes the calendar grid Monday-first.

---

## 11.8 `getMonthWeekPositions`

```ts
export function getMonthWeekPositions(year: number): {
  month: string;
  weekIndex: number;
}[] {
```

This function is specifically concerned with **where month labels should appear on the yearly heatmap**.

For example:

```text
Jan          Feb        Mar
↓            ↓          ↓

□ □ □ □ □ □ □
□ □ □ □ □ □ □
□ □ □ □ □ □ □
...
```

The function calculates the week/column position of the first day of each month.

First, it gets the weekday offset of January 1:

```ts
const firstDayOffset = getMondayFirstWeekday(year, 1, 1);
```

Then for every month:

```ts
const firstDay = new Date(year, index, 1);
```

gets the first day of that month.

This calculation:

```ts
const dayOfYear =
  Math.floor(
    (firstDay.getTime() -
      new Date(year, 0, 1).getTime()) /
      (1000 * 60 * 60 * 24),
  );
```

finds how many days have passed since January 1.

Finally:

```ts
const weekIndex = Math.floor(
  (firstDayOffset + dayOfYear) / 7,
);
```

converts that day position into a heatmap column.

The result looks like:

```ts
[
  { month: "Jan", weekIndex: 0 },
  { month: "Feb", weekIndex: 4 },
  { month: "Mar", weekIndex: 8 },
  ...
]
```

The exact positions depend on the year.

---

# 12. Putting the Frontend Together

The different pieces can now be viewed as one system:

```text
                         React Application
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
               Pages                    Components
                 │                           │
                 │                    UI + local state
                 │
               Hooks
                 │
        state + data fetching
                 │
             Services
                 │
           API operations
                 │
            apiClient
                 │
               HTTP
                 │
           Express API
```

And alongside this:

```text
Pages / Components / Hooks
          │
          └──────→ Utils
                    │
                    └── reusable calculations
```

For example:

```text
Dashboard
   │
   ├── useHabits()
   │      └── habitService.getHabits()
   │
   ├── useHabitCompletions()
   │      └── habitService.getHabitCompletions()
   │
   ├── HabitList
   │
   ├── HabitHeatmap
   │      └── getDaysInYear()
   │      └── getMonthWeekPositions()
   │
   └── AddHabitModal
```

This is the main mental model to keep while developing.

---

# 13. Where Should New Code Go?

When adding something new, ask what kind of problem it solves.

### "This is a new screen."

→ `pages/`

```text
pages/Settings.tsx
```

### "This React screen needs some server data."

→ `hooks/`

```text
hooks/useSettings.ts
```

### "I need to call a new API endpoint."

→ `services/`

```text
services/settingsService.ts
```

### "This is a reusable UI element."

→ `components/`

```text
components/SettingRow.tsx
```

### "This is a calculation that doesn't belong to React."

→ `utils/`

```text
utils/date.ts
utils/format.ts
```

### "This only matters inside one component."

→ Keep it in the component.

For example:

```text
AddHabitModal
    └── form input state
```

There is no need to create a hook just because `useState` is being used.

---

# 14. The Core Principle

The frontend isn't divided into these folders just for organization.

Each layer has a different reason to change:

```text
Page
→ changes when the screen layout changes

Component
→ changes when a UI element changes

Hook
→ changes when React state/data behaviour changes

Service
→ changes when the API contract changes

Utility
→ changes when a reusable calculation changes
```

This makes the architecture easier to reason about.

If the API changes, you shouldn't normally have to rewrite your UI.

If the UI changes, you shouldn't normally have to rewrite your API service.

If the heatmap's calendar calculation changes, you shouldn't have to touch your API.

That separation is the real purpose of the frontend structure.
