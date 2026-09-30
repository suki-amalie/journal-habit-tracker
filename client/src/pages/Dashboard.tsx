import { useEffect, useMemo, useState } from "react";

import TodayHabits from "../components/TodayHabits";
import TodayProgress from "../components/TodayProgress";
import HabitHeatmap from "../components/HabitHeatmap";
import { BlueInkDrop } from "../components/InkDrops";

import {
  getHabits,
  createHabit,
  getHabitCompletions,
  createHabitCompletion,
  deleteHabitCompletion,
} from "../services/habitService";

import { getTodayDate } from "../utils/date";
import { getCompletionCountByDate, isCompletedToday } from "../utils/habit";

import type { Habit, HabitCompletion } from "../types/habit";
import AddHabitModal from "../components/AddHabitModal";


type CompletionsByHabit = Record<number, HabitCompletion[]>;

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<CompletionsByHabit>({});
  const [error, setError] = useState<string | null>(null);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);

  const now = new Date();
  const today = getTodayDate();

  const greeting = getGreeting(now.getHours());

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Load habits
  useEffect(() => {
    async function loadHabits() {
      try {
        const data = await getHabits();
        setHabits(data);
      } catch {
        setError("Couldn't load your habits. Try refreshing.");
      } finally {
        setLoading(false);
      }
    }

    loadHabits();
  }, []);

  // Load completions for every habit.
  useEffect(() => {
    let cancelled = false;

    async function loadCompletions() {
      try {
        const results = await Promise.all(
          habits.map((habit) => getHabitCompletions(habit.id)),
        );

        if (cancelled) return;

        setCompletions(
          Object.fromEntries(
            habits.map((habit, index) => [habit.id, results[index]]),
          ),
        );

        setError(null);
      } catch {
        if (!cancelled) {
          setError("Couldn't load your habits. Try refreshing.");
        }
      }
    }

    loadCompletions();

    return () => {
      cancelled = true;
    };
  }, [habits]);

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

  async function handleToggle(habit: Habit) {
    const completed = isCompletedToday(habit.id, completions, today);

    try {
      if (completed) {
        await deleteHabitCompletion(habit.id, today);

        setCompletions((previous) => ({
          ...previous,
          [habit.id]: (previous[habit.id] ?? []).filter(
            (completion) => completion.date.slice(0, 10) !== today,
          ),
        }));
      } else {
        const created = await createHabitCompletion(habit.id, today);

        setCompletions((previous) => ({
          ...previous,
          [habit.id]: [...(previous[habit.id] ?? []), created],
        }));
      }

      setError(null);
    } catch {
      setError("Couldn't update that habit. Try again.");
    }
  }

  async function handleAddHabit(
    name: string,
    description: string | null,
  ) {
    try {
      const habit = await createHabit(name, description);

      setHabits((current) => [...current, habit]);
      setShowAddHabitModal(false);
    } catch (error) {
      console.error(error);
    }
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
            onToggle={handleToggle}
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
