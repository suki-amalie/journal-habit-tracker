import { useMemo } from "react";

import ActivityHeatmap from "../components/ActivityHeatmap";
import { JOURNAL_COLORS } from "../components/heatmapColors";
import TodayHabits from "../components/TodayHabits";
import TodayJournal from "../components/TodayJournal";

import { useHabits } from "../hooks/useHabits";
import { useHabitCompletions } from "../hooks/useHabitsCompletions";
import { useJournalActivity } from "../hooks/useJournalActivity";
import { useJournalEntries } from "../hooks/useJournalEntries";

import { getTodayDate } from "../utils/date";
import { getCompletionCountByDate } from "../utils/habit";

function Dashboard() {
  const today = getTodayDate();

  const { habits, loading, error: habitsError } = useHabits();
  const { completions, completedHabitIds, error: completionsError, toggleHabit } =
    useHabitCompletions(habits);
  const { countsByDate: journalCountsByDate, error: journalActivityError } =
    useJournalActivity(Number(today.slice(0, 4)));
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

  const dateLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return <p className="px-6 py-16 text-sm text-[#716d63]">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header>
        <h1 className="font-serif text-4xl text-[#292824]">Dashboard</h1>
        <p className="mt-2 text-sm text-[#716d63]">{dateLabel}</p>
        <p className="mt-1 text-sm text-[#716d63]">
          A quiet look at what you've been doing.
        </p>
      </header>

      {error && (
        <p role="alert" className="mt-8 rounded-md border border-[#d8b8b3] bg-[#fbf5f3] px-4 py-3 text-sm text-[#76534d]">
          {error}
        </p>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[#716d63]">
          Today
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <TodayHabits
            habits={activeHabits}
            completedHabitIds={completedHabitIds}
            onToggle={toggleHabit}
          />
          <TodayJournal entries={entries} loading={entriesLoading} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[#716d63]">
          Habit activity
        </h2>
        <ActivityHeatmap
          title="Habit activity"
          description="Your habit completions throughout the year"
          countsByDate={habitCountsByDate}
          tooltip={(date, count) => `${date}: ${count} habit completions`}
          footerLink={{ to: "/habits", label: "View habits" }}
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[#716d63]">
          Journal activity
        </h2>
        <ActivityHeatmap
          title="Journal activity"
          description="Days you wrote"
          countsByDate={journalCountsByDate}
          colors={JOURNAL_COLORS}
          tooltip={(date, count) =>
            `${date}: ${count} journal ${count === 1 ? "entry" : "entries"}`
          }
          footerLink={{ to: "/journal/history", label: "Open journal" }}
        />
      </section>
    </div>
  );
}

export default Dashboard;