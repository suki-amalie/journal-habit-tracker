import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ActivityHeatmap from "../components/ActivityHeatmap";
import { JOURNAL_COLORS } from "../components/heatmapColors";
import { PetalDrift } from "../components/Petal";
import TodayHabits from "../components/TodayHabits";
import TodayJournal from "../components/TodayJournal";

import { useHabits } from "../hooks/useHabits";
import {
  useHabitCompletions,
  useHabitCompletionsForYear,
} from "../hooks/useHabitsCompletions";
import { useJournalActivity } from "../hooks/useJournalActivity";
import { useJournalEntries } from "../hooks/useJournalEntries";
import { useHotkey } from "../hooks/useHotkey";

import { getTodayDate } from "../utils/date";
import { getCompletionCountByDate } from "../utils/habit";

/** Which activity heatmap the dashboard card is showing. */
type ActivityView = "habits" | "journal";

/** Layout props shared by both dashboard heatmaps. */
const DASHBOARD_HEATMAP = {
  compact: true,
  vertical: true,
  flat: true,
  smallCells: true,
  monthColumns: "grid-cols-4 lg:grid-cols-6",
} as const;

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Calm landing page: a greeting, read-only progress for today, and one
 * yearly heatmap that switches between habits and journal activity.
 * Ticking habits happens on the Habits page.
 */
function Dashboard() {
  const navigate = useNavigate();
  const today = getTodayDate();

  // Each heatmap keeps its own year so switching tabs does not reset navigation.
  const currentYear = Number(today.slice(0, 4));
  const [habitYear, setHabitYear] = useState(currentYear);
  const [journalYear, setJournalYear] = useState(currentYear);

  const { habits, loading, error: habitsError } = useHabits("all");
  const {
    completions: recentCompletions,
    completedHabitIds,
    error: completionsError,
  } = useHabitCompletions(habits);
  const pastCompletions = useHabitCompletionsForYear(
    habitYear,
    habitYear !== currentYear,
  );
  const completions =
    habitYear === currentYear ? recentCompletions : pastCompletions.completions;
  const {
    countsByDate: journalCountsByDate,
    error: journalActivityError,
    firstActivityYear: firstJournalActivityYear,
  } = useJournalActivity(journalYear);
  const { entries, loading: entriesLoading } = useJournalEntries(today);

  const error = completionsError ?? habitsError ?? journalActivityError;

  const activeHabits = useMemo(
    () => habits.filter((habit) => habit.archivedAt === null),
    [habits],
  );

  const habitCountsByDate = useMemo(
    () => getCompletionCountByDate(completions),
    [completions],
  );

  const [view, setView] = useState<ActivityView>("habits");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  useHotkey("t", () =>
    setView((current) => (current === "habits" ? "journal" : "habits")),
  );

  // Habits completed on the date clicked in the habit heatmap.
  const completedOnSelectedDate = useMemo(() => {
    if (selectedDate === null) return [];

    return habits.filter((habit) =>
      (completions[habit.id] ?? []).some(
        (completion) => completion.date.slice(0, 10) === selectedDate,
      ),
    );
  }, [habits, completions, selectedDate]);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return <p className="px-6 py-16 text-sm text-[#716d63]">Loading...</p>;
  }

  const greeting = getGreeting(new Date().getHours());

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <header className="relative">
        <PetalDrift />
        <h1 className="relative font-serif text-3xl text-[#292824]">
          {greeting}
          <span className="text-drop-pink">.</span>
        </h1>
        <p className="mt-1 text-sm text-[#8a867c]">{dateLabel}</p>
      </header>

      {error && (
        <p
          role="alert"
          className="mt-8 rounded-md border border-[#d8b8b3] bg-[#fbf5f3] px-4 py-3 text-sm text-[#76534d]"
        >
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-[2fr_3fr]">
        <TodayHabits
          habits={activeHabits}
          completedHabitIds={completedHabitIds}
        />
        <TodayJournal entries={entries} loading={entriesLoading} />
      </div>

      <section className="mt-8 rounded-2xl border border-[#e6dfd2] bg-[#fffefa] p-5">
        <div
          className="mb-4 inline-flex rounded-full bg-[#efe9dc] p-0.5 text-sm"
          role="tablist"
          aria-label="Activity"
        >
          {(["habits", "journal"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              title="Switch activity view (T)"
              className={`rounded-full px-4 py-1 capitalize transition-colors ${
                view === key
                  ? "bg-[#fffefa] text-[#292824] shadow-sm"
                  : "text-[#8a867c] hover:text-[#292824]"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {view === "habits" ? (
          <>
            <ActivityHeatmap
              {...DASHBOARD_HEATMAP}
              title="Habit activity"
              description=""
              countsByDate={habitCountsByDate}
              onYearChange={setHabitYear}
              tooltip={(date, count) => `${date}: ${count} habit completions`}
              selectedDate={selectedDate}
              onSelectDate={(date) =>
                setSelectedDate((current) => (current === date ? null : date))
              }
            />

            {selectedDate && (
              <div className="mt-3 rounded-xl bg-[#f7f3ea] px-3 py-2">
                <h3 className="text-sm font-medium text-[#292824]">
                  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-[#292824]">
                  {completedOnSelectedDate.length === 0 && (
                    <li className="text-[#8a867c]">Nothing completed.</li>
                  )}
                  {completedOnSelectedDate.map((habit) => (
                    <li key={habit.id} className="flex items-center gap-2">
                      <span className="text-[#4F8A47]">✓</span>
                      {habit.name}
                      {habit.archivedAt !== null && (
                        <span className="text-xs text-[#716d63]">
                          (archived)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <ActivityHeatmap
            {...DASHBOARD_HEATMAP}
            title="Journal activity"
            description=""
            countsByDate={journalCountsByDate}
            onYearChange={setJournalYear}
            minYear={firstJournalActivityYear}
            colors={JOURNAL_COLORS}
            tooltip={(date, count) =>
              `${date}: ${count} journal ${count === 1 ? "entry" : "entries"}`
            }
            onSelectDate={(date) => navigate(`/journal/history?date=${date}`)}
          />
        )}
      </section>
    </div>
  );
}

export default Dashboard;
