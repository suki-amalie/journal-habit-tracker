# Design Spec — Hibi Notes

A guide to the components, and design decisions behind this app. Read this before adding a new screen or component so new UI stays visually consistent with the rest of the app.

> "Hibi" (日々) means "day by day" in Japanese — the name reflects the app's theme: small, daily habits and daily journaling.

---

## 1. Design Concept

The app's aesthetic is a **warm, handwritten journal with watercolor ink accents**. 

- **Warm paper background** (`#f7f3ea`) instead of stark white.
- **A dark wood-brown sidebar** (`#5A3E32`) evokes a desk/cover of a journal.
- **Watercolor "ink drop" blobs** (SVG, see [§5](#5-the-ink-drop-motif)) are the signature decorative element, used near the logo and action buttons.
- **Three handwriting-adjacent fonts** are mixed deliberately (serif for headings, handwriting font for playful accents, sans-serif for body/UI text) — see [§3](#3-typography).


Keep this mood in mind: **soft, warm, ink-and-paper**, not corporate/clinical.

---

## 2. Color Palette

All colors are hand-picked hex values used directly in Tailwind arbitrary-value classes (e.g. `bg-[#f7f3ea]`), not Tailwind's default palette. There is no `tailwind.config` color theme — colors live inline in components. When adding new UI, reuse these values instead of inventing new ones.

### Backgrounds & surfaces

| Color | Hex | Usage |
|---|---|---|
| Paper (page background) | `#f7f3ea` | Main content background (`AppLayout`, inputs) |
| Card / surface | `#fffefa` | Cards like `TodayHabits`, `TodayProgress`, `HabitHeatmap` |
| Sidebar (wood brown) | `#5A3E32` | Desktop sidebar background (`AppHeader`) |
| Modal surface | `#FFFCF5` | `AddHabitModal`, editable journal textarea |

### Text

| Color | Hex | Usage |
|---|---|---|
| Primary text | `#292824` | Headings, main body text |
| Secondary text | `#716d63` / `#716D63` | Subtext, helper copy, timestamps |
| Muted text | `#AAA69D` | Placeholder hints, "(optional)" labels |
| Sidebar text (default) | `#D8C8BA` | Inactive nav links |
| Sidebar text (active/hover) | `#F7F3EA` | Active/hovered nav links, logo on dark bg |

### Borders & dividers

| Color | Hex | Usage |
|---|---|---|
| Card border | `#ddd9d0` | Card outlines |
| Divider | `#eae7df` | Row separators (e.g. between habits) |
| Input border | `#D8D0C2` | Form inputs, modal borders |

### Brand ink-drop colors (the 3 accent colors)

These three colors are the "signature palette" and always appear together as a trio near the logo:

| Color | Hex | Meaning | Component helper |
|---|---|---|---|
| Blue | `#6B8FC4` | Reflection | `BlueInkDrop` |
| Green | `#4F8A47` | Action | `GreenInkDrop` |
| Pink | `#D98B9B` | Encouragement | `PinkInkDrop` |

**Rule of thumb:** Green = positive/affirmative actions (save, progress, completed state). Blue = journal/reflection-related actions ("Write today" link). Pink = currently decorative/encouragement only — reuse it for gentle, non-critical highlights.

### Heatmap intensity scale (habit activity)

A 5-step sequential scale from "no activity" to "max activity" (modeled after GitHub's contribution graph):

```
0 completions → #eae7df  (empty, same as divider color)
1 completion  → #b7d1b0  (light)
2 completions → #82b07a  (medium)
3 completions → #5f9657  (high)
4+ completions→ #3f7d3a  (max)
```

Defined in [`HabitHeatmap.tsx`](../client/src/components/HabitHeatmap.tsx) as `INTENSITY_CLASSES`. If you add a new heatmap elsewhere (e.g. for journal entries), reuse this exact array for consistency.

### Status colors

| Color | Hex | Usage |
|---|---|---|
| Error text | `#76534d` | Error banner text |
| Error background | `#fbf5f3` | Error banner background |
| Error border | `#d8b8b3` | Error banner border |
| Success / progress bar fill | `#4f8a47` | Progress bar, save buttons |

---

## 3. Typography

Fonts are declared once as CSS variables in [`index.css`](../client/src/index.css) and exposed as Tailwind utility classes via `@theme`:

```css
@theme {
  --font-sans: "DM Sans", sans-serif;
  --font-serif: "DM Serif Display", serif;
  --font-handwriting: "Caveat", cursive;
}
```

This gives you three Tailwind classes to choose from: `font-sans` (default, don't need to apply explicitly), `font-serif`, and `font-handwriting`.

| Font | Tailwind class | When to use |
|---|---|---|
| **DM Sans** | *(default body font)* | All body copy, labels, buttons, form inputs — anything functional/UI |
| **DM Serif Display** | `font-serif` | Page titles and section headings (e.g. "Hibi Notes" logo, "Journal", "{Greeting}.") — gives the journal/editorial feel |
| **Caveat** (handwriting) | `font-handwriting` | Playful, personal touches only: the date label ("Monday, October 1, 2026") and the "Write today" link. Use **sparingly** — it's a decorative accent, not for dense text |

**Sizing conventions observed in the codebase:**
- Page titles: `text-3xl` to `text-5xl` with `font-serif`
- Card headings: `text-lg font-semibold`
- Body/help text: `text-sm`, color `#716d63`
- Handwriting accents: oversized, e.g. `text-xl` (date label) up to `text-6xl` (the "Write today" CTA)

---

## 4. Layout & Spacing

### Page shell

- [`AppLayout.tsx`](../client/src/layouts/AppLayout.tsx) renders a fixed sidebar (`AppHeader`, 192px / `w-48`, desktop-only via `lg:block`) + a scrollable main content area with the paper background.
- On mobile/tablet (`< lg`), the sidebar is hidden entirely — there's currently **no mobile nav fallback** (see [§7 Known Gaps](#7-known-gaps-for-new-contributors)).
- Main content is centered with `mx-auto max-w-7xl` (Dashboard) or `max-w-4xl` (Journal) and horizontal padding `px-4 sm:px-6`.

### Cards

Every content "box" (habits list, progress, heatmap, modal) shares the same recipe — copy this pattern for new cards:

```
rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-6 sm:p-7
```

### Grid

Dashboard's main content uses a responsive grid: `grid gap-6 lg:grid-cols-3`, with the habits list spanning `lg:col-span-2` and progress taking the remaining column. Below large breakpoints everything stacks (`order-first` is used to reorder progress above habits on mobile).

### Spacing scale

Stick to Tailwind's default spacing scale (multiples of 4px: `gap-1`, `gap-2`, `p-6`, `mt-8`, etc.) — nothing custom is defined. Common values seen: `gap-6`, `p-6`/`p-7`, `mt-2`/`mt-4`/`mt-6`/`mt-8`.

---

## 5. The Ink Drop Motif

The watercolor "ink drop" is the app's signature visual flourish — a hand-drawn-looking blob made of layered SVG paths with an SVG turbulence/displacement filter to fake a watercolor bleed effect (see [`InkDrops.tsx`](../client/src/components/InkDrops.tsx)).

- **`InkDrop`**: the base component. Takes a `color`, `size`, and `variant` (1–3, each a slightly different blob shape).
- **`InkDropGroup`**: renders all three brand colors together (blue, green, pink) — used next to the logo in the sidebar and header.
- **`BlueInkDrop` / `GreenInkDrop` / `PinkInkDrop`**: convenience wrappers for a single colored drop, used for individual accents (e.g. the blue drop next to "Write today").

**Animation:** a `.animate-ink-drop` utility class (defined in `index.css`) pops an element in with a scale+opacity "bloom" over 650ms — use this when introducing a new ink-drop-styled element that should animate in.

**When to add a new ink drop:** only for brand moments (logo, key CTAs) — don't scatter them everywhere or they lose their specialness.

---

## 6. Components Reference

| Component | Purpose | Key visual notes |
|---|---|---|
| [`AppHeader`](../client/src/components/AppHeader.tsx) | Desktop sidebar nav | Dark wood background, logo + ink drops at top, nav links with active-state highlight |
| [`HeaderLogo`](../client/src/components/HeaderLogo.tsx) | Compact logo (serif text + mini ink drops) | Used wherever a small branded logo is needed outside the sidebar |
| [`TodayHabits`](../client/src/components/TodayHabits.tsx) | List of today's habits with toggle | Completed habits get a strikethrough line that visually "extends" across the name (like crossing off a to-do list) |
| [`TodayProgress`](../client/src/components/TodayProgress.tsx) | Today's completion count + encouraging message | Message text changes based on % complete (see `getMessage`) — keep this habit-forming, non-judgmental tone for any new copy |
| [`HabitHeatmap`](../client/src/components/HabitHeatmap.tsx) | GitHub-style yearly contribution heatmap | Monday-first week grid, year navigation arrows, intensity scale from §2 |
| [`AddHabitModal`](../client/src/components/AddHabitModal.tsx) | Form to create a new habit | Centered modal, click-outside-to-close, green accent border on focused input |
| [`DailyEntry`](../client/src/components/DailyEntry.tsx) | Journal entry editor/viewer | Renders Markdown when viewing; plain textarea when editing; serif heading for the date |
| [`InkDrops`](../client/src/components/InkDrops.tsx) | Decorative SVG blobs | See §5 |

---

## 7. Known Gaps (for new contributors)

Things that are visually/structurally incomplete today — good first design tasks if you want to contribute:

- **No mobile navigation.** The sidebar (`AppHeader`) is `hidden` below the `lg` breakpoint with no replacement (no hamburger menu, no bottom nav). Mobile users currently have no way to navigate between Dashboard and Journal.
- **Journal page heatmap is unbuilt.** [`Journal.tsx`](../client/src/pages/Journal.tsx) has a placeholder comment (`{/* JournalHeatmap will go here */}`) where a journal-specific calendar/heatmap was planned but never implemented.
- **No "saving…" or autosave feedback** in `DailyEntry` — saving a journal entry gives no loading/success indicator.
- **`JournalPreview.tsx`** exists as an empty file — reserved for a future component (e.g. a read-only preview card), not yet implemented.
- **No dark mode.** Only the warm/light "paper" theme exists.

---

## 8. Quick Checklist for New UI

When building a new screen or component, check that it:

- [ ] Uses the paper (`#f7f3ea`) / card (`#fffefa`) background pair, not plain white
- [ ] Uses `font-serif` for the heading, default sans for body text, and `font-handwriting` only for a small decorative accent (if any)
- [ ] Reuses existing hex colors from §2 instead of introducing new ones
- [ ] Wraps card-like content in `rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-6 sm:p-7`
- [ ] Considers how it collapses on mobile (remember: no sidebar nav below `lg`)
- [ ] Uses an ink drop only for a genuine brand moment, not as generic decoration
