import { useMemo, useState } from "react";

import TodayHabits from "../components/TodayHabits";
import TodayProgress from "../components/TodayProgress";
import HabitHeatmap from "../components/HabitHeatmap";
import { BlueInkDrop } from "../components/InkDrops";

import { useHabits } from "../hooks/useHabits";
import { useHabitCompletions } from "../hooks/useHabitsCompletions";

import { getTodayDate } from "../utils/date";
import { getCompletionCountByDate, isCompletedToday } from "../utils/habit";

import AddHabitModal from "../components/AddHabitModal";

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { habits, loading, error: habitsError, addHabit } = useHabits();
  const {
    completions,
    error: completionsError,
    toggleHabit,
  } = useHabitCompletions(habits);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);

  const error = completionsError ?? habitsError;

  const now = new Date();
  const today = getTodayDate();

  const greeting = getGreeting(now.getHours());

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Derived data.
  const completionsByDate = useMemo(
    () => getCompletionCountByDate(completions),
    [completions],
  );

  // Archived habits are hidden from today's list,
  // but their historical completions remain available
  // for the heatmap.
  const activeHabits = useMemo(
    () => habits.filter((habit) => habit.archivedAt === null),
    [habits],
  );

  const completedHabitIds = useMemo(
    () =>
      new Set(
        activeHabits
          .filter((habit) => isCompletedToday(habit.id, completions, today))
          .map((habit) => habit.id),
      ),
    [activeHabits, completions, today],
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-sm text-[#716d63]">Opening your journal...</p>
      </main>
    );
  }

  async function handleAddHabit(
    name: string,
    description: string | null,
  ) {
    await addHabit(name, description);
    setShowAddHabitModal(false);
  }

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Today's page */}
        <section className="mb-14">
          <p className="font-handwriting text-xl text-[#716d63]">{dateLabel}</p>

          <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-4xl leading-tight text-[#292824] sm:text-5xl">
                {greeting}.
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-[#716d63] sm:text-base">
                Take a moment to reflect on your day.
              </p>
            </div>

            <button
              type="button"
              className="group flex items-center gap-3 self-start text-[#6B8FC4] sm:self-auto"
            >
              <BlueInkDrop
                size={21}
                className="transition-transform group-hover:scale-110"
              />

              <span className="font-handwriting text-6xl underline decoration-[#6B8FC4]/40 decoration-2 underline-offset-4 transition-colors group-hover:decoration-[#6B8FC4] sm:text-2xl">
                Write today
              </span>
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mb-8 rounded-md border border-[#d8b8b3] bg-[#fbf5f3] px-4 py-3 text-sm text-[#76534d]"
          >
            {error}
          </p>
        )}

        {/* Today's habits and progress */}
        <section className="grid gap-6 lg:grid-cols-3">
          <TodayHabits
            habits={activeHabits}
            completedHabitIds={completedHabitIds}
            onToggle={toggleHabit}
            onAddHabit={() => setShowAddHabitModal(true)}
          />

          <TodayProgress
            done={completedHabitIds.size}
            total={activeHabits.length}
          />
        </section>

        {/* Yearly record */}
        <section className="mt-12">
          <HabitHeatmap completionsByDate={completionsByDate} />
        </section>
      </div>

      {showAddHabitModal && (
        <AddHabitModal
          onClose={() => setShowAddHabitModal(false)}
          onAdd={handleAddHabit}
        />
      )}
    </main>
  );
}

export default Dashboard;
