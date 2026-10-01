import { useEffect, useState } from "react";

import {
  getAllHabitCompletions,
  createHabitCompletion,
  deleteHabitCompletion,
} from "../services/habitService";

import type { Habit, HabitCompletion } from "../types/habit";

import { getTodayDate } from "../utils/date";
import { isCompletedToday } from "../utils/habit";

interface HabitCompletions {
  completions: Record<number, HabitCompletion[]>;
  completedHabitIds: Set<number>;
  error: string | null;
  toggleHabit: (habit: Habit) => Promise<void>;
}

export function useHabitCompletions(
  habits: Habit[],
): HabitCompletions {
  const [completions, setCompletions] = useState<
    Record<number, HabitCompletion[]>
  >({});
  const [error, setError] = useState<string | null>(null);

  const today = getTodayDate();

  useEffect(() => {
    async function loadCompletions() {
      try {
        const completionList = await getAllHabitCompletions();

        const completionMap: Record<number, HabitCompletion[]> = {};

        for (const completion of completionList) {
          (completionMap[completion.habitId] ??= []).push(completion);
        }

        setCompletions(completionMap);
        setError(null);
      } catch {
        setError("Couldn't load your habits. Try refreshing.");
      }
    }

    if (habits.length > 0) {
      loadCompletions();
    }
  }, [habits]);

  async function toggleHabit(habit: Habit) {
    const completed = isCompletedToday(
      habit.id,
      completions,
      today,
    );

    try {
      if (completed) {
        await deleteHabitCompletion(habit.id, today);

        setCompletions((current) => ({
          ...current,
          [habit.id]: current[habit.id].filter(
            (completion) =>
              completion.date.slice(0, 10) !== today,
          ),
        }));
      } else {
        const newCompletion = await createHabitCompletion(
          habit.id,
          today,
        );

        setCompletions((current) => ({
          ...current,
          [habit.id]: [
            ...(current[habit.id] ?? []),
            newCompletion,
          ],
        }));
      }

      setError(null);
    } catch {
      setError("Couldn't update that habit. Try again.");
    }
  }

  const completedHabitIds = new Set(
    habits
      .filter((habit) =>
        isCompletedToday(habit.id, completions, today),
      )
      .map((habit) => habit.id),
  );

  return {
    completions,
    completedHabitIds,
    error,
    toggleHabit,
  };
}