# Dashboard

The Dashboard is the **overview**.
It shouldn't be where you manage every habit or browse every journal entry. It gives you a quick picture of your activity:

```text

┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Dashboard                                                       │
│  October 4, 2026                                                │
│  A quiet look at what you've been doing.                        │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  TODAY                                                           │
│                                                                  │
│  Habits                         Journal                          │
│  ┌──────────────────────┐      ┌────────────────────────────┐   │
│  │  3 / 4 completed     │      │  ✓ Written                  │   │
│  │                      │      │                            │   │
│  │  LeetCode       ✓    │      │  "Today I..."              │   │
│  │  Reading        ✓    │      │                            │   │
│  │  Exercise       ✓    │      │              Open journal → │   │
│  │    View all habits ->│      └────────────────────────────┘   │
│  └──────────────────────┘                                       │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  HABIT ACTIVITY                                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Jan        Mar        May        Jul        Sep           │  │
│  │  · ■ ■ · ■ · · ■ ■ · ■ · · ■ · · · ■ · · ■ ·            │  │
│  │  ■ · ■ ■ · ■ · ■ · · ■ ■ · ■ · · ■ · ■ · · ·            │  │
│  │  · ■ · · ■ · · ■ · ■ · · ■ · · ■ · · ■ · · ■            │  │
│  │                                                            │  │
│  │                         View habits →                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  JOURNAL ACTIVITY                                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  Jan        Mar        May        Jul        Sep           │  │
│  │  · · ■ · · ■ · · · ■ · · · · ■ · · ■ · · · ■ ·            │  │
│  │  · ■ · · · · ■ · · · · ■ · · · · · ■ · · · ·             │  │
│  │  ■ · · ■ · · · · ■ · · · · · ■ · · · · ■ · ·             │  │
│  │                                                            │  │
│  │                         Open journal →                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Today → quick snapshot of today.
Habit Activity → small aggregated overview → click through to Habits.
Journal Activity → small overview → click through to Journal.
Habits page → actually manage/inspect individual habits and their histories.
Journal page → actually browse and write entries.

# Habits

The Habits page is where the actual habit-tracking system lives.

Something like:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Habits                                           + Add habit       │
│  Build consistency, one day at a time.                             │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  YOUR HABITS                                                        │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  LeetCode                                      ✓ Completed    │  │
│  │  Solve at least one problem and understand the solution.     │  │
│  │                                                               │  │
│  │  12 day streak                                                 │  │
│  │                                                               │  │
│  │  History                                                       │  │
│  │  Jan       Mar       May       Jul       Sep                  │  │
│  │  · ■ ■ ■ · ■ ■ · · ■ ■ ■ · ■ · · ■ ■ · · ■ · ·              │  │
│  │  ■ ■ · ■ · ■ · ■ ■ · ■ · ■ ■ · · ■ · ■ ■ · · ·              │  │
│  │                                                               │  │
│  │                                              Edit   Delete     │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  Reading                                         ○ Not done   │  │
│  │  Read at least 10 pages.                                     │  │
│  │                                                               │  │
│  │  3 day streak                                                  │  │
│  │                                                               │  │
│  │  History                                                       │  │
│  │  Jan       Mar       May       Jul       Sep                  │  │
│  │  · ■ · ■ ■ · · ■ · ■ · ■ ■ · · ■ · · ■ · · ■                │  │
│  │  ■ · · ■ · ■ · ■ · · ■ · · ■ ■ · · ■ · ■ · · ·              │  │
│  │                                                               │  │
│  │                                              Edit   Delete     │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  Exercise                                       ✓ Completed   │  │
│  │  Go to the gym or exercise for at least 20 minutes.          │  │
│  │                                                               │  │
│  │  5 day streak                                                  │  │
│  │                                                               │  │
│  │  History                                                       │  │
│  │  Jan       Mar       May       Jul       Sep                  │  │
│  │  · ■ ■ · ■ · ■ ■ · · ■ · ■ ■ · · ■ · ■ · · ·                │  │
│  │  ■ · ■ · ■ ■ · · ■ · ■ · · ■ · · ■ · · ■ ■ ·                │  │
│  │                                                               │  │
│  │                                              Edit   Delete     │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Important Distinction
**Dashboard**: "How active have I been overall?"

**Habits**: "How has each individual habit been going?"

# Journal Pages
```
Journal
│
├── Write       ← dedicated writing page
├── History     ← browse past entries
└── Explore    ← patterns / self-organizing graph
```

                         JOURNAL
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
        WRITE             HISTORY            EXPLORE
          │                 │                  │
          │                 │                  │
       create             time              meaning
       entries            based              based
                           │                  │
                           │                  │
                           ▼                  ▼
                       "What did I       "What am I
                        write?"          noticing?"
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                                 Clusters          Relationships
                                    │                   │
                                    └─────────┬─────────┘
                                              ▼
                                           Entries
                                              │
                                              ▼
                                           Insights

## Journal write page
```text
┌──────────────────────────────┐
│ Journal                      │
│                              │
│ October 5, 2026 · 4:36 PM    │
│                              │
│ ───────────────────────────  │
│                              │
│ Write...                     │
│                              │
│                              │
│                              │
│                              │
│                              │
│                              │
│                              │
│                              │
│                       Save   │
└──────────────────────────────┘
```

## Journal history page

```text
Journal History

Your year in reflection.


                         2026

      Jan        Mar        May        Jul        Sep
      │          │          │          │          │
      · ■ · · ■  · · ■ · ·  ■ · · · ■  · ■ · · ·  ■ · ■ ·
      ■ · ■ · ·  ■ · · · ■  · ■ · · ·  ■ · · ■ ·  · · ■ ·


────────────────────────────────────────

October 5, 2026

10:00 AM
Feeling motivated today...

3:30 PM
Frustrated with this problem...

11:20 PM
Finally figured out the graph problem...


────────────────────────────────────────

Recent entries

Oct 5 · 11:20 PM   Finally figured out...
Oct 5 · 3:30 PM    Frustrated with...
Oct 4 · 10:15 PM   Thinking about Hibi...
Oct 3 · 6:40 PM    Watched a movie...
```

## Journal explore page

```text
Explore

Discover connections across your journal.

────────────────────────────────────────────────────────────

                         YOUR THOUGHTS

                    ● Music
                   /        \
                  /          \
          ● Weekend          ● Relaxation
                \             /
                 \           /
                  ● Positive

                        ●
                       /
              ● Programming
             /       \
            /         \
      ● Frustration   ● Confidence
             \         /
              \       /
               ● Self-doubt


────────────────────────────────────────────────────────────

Clusters

┌──────────────────────┐  ┌──────────────────────┐
│ Programming          │  │ University           │
│ 18 entries           │  │ 14 entries           │
│ frustration          │  │ assignments          │
│ confidence           │  │ exams                │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ Music                │  │ Career               │
│ 9 entries            │  │ 11 entries           │
│ weekends             │  │ future               │
│ relaxation           │  │ uncertainty          │
└──────────────────────┘  └──────────────────────┘
```