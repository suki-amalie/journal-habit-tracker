# Frontend guide

A contributor's map of `client/` (React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router + TanStack Query). For the backend and data flow overview see [CODEBASE_GUIDE.md](CODEBASE_GUIDE.md).

## Commands

Run from `client/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npx tsc -b` | Type-check |
| `npx eslint src` | Lint |
| `npx vitest run` | Unit/component tests |
| `npx vite build` | Production build |

## Folder layout (`client/src`)

| Folder | What lives there |
| --- | --- |
| `pages/` | One component per route: `Dashboard`, `Habits`, `Journal` (Write), `JournalHistory` |
| `layouts/` | `AppLayout` (sidebar + page frame), `JournalLayout` (Write/History tabs) |
| `components/` | Reusable UI (rows, cards, heatmap, book, modals, ink drops) |
| `hooks/` | Data hooks (TanStack Query) and UI-state hooks |
| `services/` | Thin `fetch` wrappers per API area; `apiClient.ts` is the shared base |
| `utils/` | Pure helpers (dates, streaks); keep these unit-tested |
| `types/` | Shared TypeScript types |
| `lib/` | `queryClient` setup |

Routes are declared in `App.tsx`; every page renders inside `AppLayout`, and Journal pages additionally inside `JournalLayout`.

## Data flow

```text
page -> hook (useHabits, useJournalEntries, ...) -> service -> apiClient -> API
```

* Pages stay thin: they call hooks and compose components.
* Hooks own caching, loading and error state. Mutations invalidate the relevant query keys.
* Services are the only place that knows URLs. Dates are local-calendar `YYYY-MM-DD` for habits; journal entries use ISO timestamps (see README "Data model notes").
* Never fetch inside a component directly.

## Design system ("Hibi Notes")

Tokens live in `@theme` at the top of `src/index.css` and give utility classes such as `bg-paper`, `text-ink`, `bg-blush`, `text-rose-ink`, `bg-drop-pink`.

| Meaning | Colour | Where it's used |
| --- | --- | --- |
| Sidebar / primary | bark brown `#5A3E32` | sidebar, primary buttons |
| Background | parchment `#f7f3ea`, card `#fffefa` | page and cards |
| Reflection | blue `#6B8FC4` | journal heatmap, "look back" book tab |
| Action | green `#4F8A47` | completed habit tick, habit heatmap |
| Encouragement | cherry blossom pink `#F2B5C8` | accents, streak dot, "look ahead" tab |

Fonts: `font-sans` (DM Sans, body), `font-serif` (DM Serif Display, headings), `font-handwriting` (Caveat, empty states and the Write prompt).

Many components still use raw hex values; prefer the tokens in new code and migrate old ones opportunistically.

Style conventions: calm and minimal, rounded cards with a `#e6dfd2` border, no heavy shadows. Motion must stay subtle; `prefers-reduced-motion` is globally honoured in `index.css`.

Custom CSS (keyframes, scrollbars) belongs in `index.css` with a comment; everything else uses Tailwind classes.

## Key components

* **`ActivityHeatmap`**: yearly grid. Variants: default (horizontal), `vertical` (12 mini months), `compact`, `flat`, `monthColumns`. Colours come from `heatmapColors.ts`.
* **`JournalDayBook`**: open-book view. One entry per page, two pages per spread when the viewport is at least 800px; long entries scroll inside their page. Blue left tab = back, pink right tab = forward. `footer` becomes an extra final page (Write prompt).
* **`HabitRow`**: habit with tick, streak, and expandable heatmap/actions. A pink dot shows at a 3+ day streak.
* **`EntryModal` / `MarkdownEditor` / `MarkdownContent`**: edit and render Markdown.
* **`InkDrops`**: brand motif. **`EmptyState`**: gentle placeholder. **`Petal`**: decorative sakura petals.

## Keyboard shortcuts

Shortcuts are registered with `useHotkey(key, handler)` (`hooks/useHotkey.ts`). It ignores key presses while typing and when Ctrl/Alt/Meta is held.

| Key | Action | Defined in |
| --- | --- | --- |
| `B` | Toggle sidebar | `layouts/AppLayout.tsx` |
| `?` | Open the cheat sheet | `layouts/AppLayout.tsx` |
| `C` | Toggle journal calendar | `pages/JournalHistory.tsx` |
| `E` | Expand/collapse all habit heatmaps | `pages/Habits.tsx` |
| `←` `→` | Turn journal pages | `hooks/useBookNavigation.ts` |

**To add a shortcut:** call `useHotkey` in the page or layout that owns the behaviour, then add a row to `components/shortcuts.ts` so the cheat sheet (`ShortcutsHelp`) stays correct, and mention the key in the control's `title`.

## Persisted UI state

`usePersistentToggle(key)` stores booleans in localStorage: `layout:sidebar-collapsed`, `journal:calendar-hidden`. Entry drafts use `journal:edit-draft:<id>`. Always wrap storage access in try/catch (it can be unavailable).

## Recipes

**Add a page**
1. Create `pages/MyPage.tsx`.
2. Add a `<Route>` in `App.tsx` (inside `AppLayout`).
3. Add a nav item to `navItems` in `components/AppHeader.tsx`.

**Add an API-backed feature**
1. Add a function to the matching file in `services/`.
2. Wrap it in a hook in `hooks/` (query for reads, mutation plus invalidation for writes).
3. Use the hook from the page; add a test for any non-trivial logic in `utils/`.

**Add a heatmap**: render `ActivityHeatmap` with a `Map<date, count>`, a `tooltip`, and optionally `colors`, `onSelectDate`, `onYearChange`.

**Add an empty state**: use `<EmptyState title="..." hint="..." />` rather than bare text.

## Testing

Vitest and Testing Library, files named `*.test.ts(x)` next to the code. Put logic in `utils/` or hooks so it can be tested without rendering pages. Run `npx tsc -b`, `npx eslint src` and `npx vitest run` before opening a PR.
