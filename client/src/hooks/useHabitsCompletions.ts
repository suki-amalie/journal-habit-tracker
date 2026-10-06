import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createHabitCompletion,
  deleteHabitCompletion,
  getAllHabitCompletions,
} from "../services/habitService";
import type { Habit, HabitCompletion } from "../types/habit";
import { addDays, getTodayDate } from "../utils/date";
import { isCompletedToday } from "../utils/habit";

interface HabitCompletions {
  completions: Record<number, HabitCompletion[]>;
  completedHabitIds: Set<number>;
  error: string | null;
  toggleHabit: (habit: Habit) => Promise<void>;
}

// Matches the server default window (366 days); older history is fetched per year.
const COMPLETIONS_KEY = ["completions", "recent"];

function groupByHabit(list: HabitCompletion[]) {
  const map: Record<number, HabitCompletion[]> = {};
  for (const completion of list) {
    (map[completion.habitId] ??= []).push(completion);
  }
  return map;
}

export function useHabitCompletionsForYear(year: number, enabled: boolean) {
  const query = useQuery({
    queryKey: ["completions", "year", year],
    queryFn: () =>
      getAllHabitCompletions({ from: `${year}-01-01`, to: `${year}-12-31` }),
    enabled,
  });

  const completions = useMemo(() => groupByHabit(query.data ?? []), [query.data]);

  return { completions, error: query.isError };
}

export function useHabitCompletions(habits: Habit[]): HabitCompletions {
  const queryClient = useQueryClient();
  const today = getTodayDate();
  const [actionError, setActionError] = useState<string | null>(null);
  const pending = useRef(new Set<number>());

  const query = useQuery({
    queryKey: COMPLETIONS_KEY,
    queryFn: () =>
      getAllHabitCompletions({ from: addDays(today, -365), to: today }),
  });

  const completions = useMemo(() => groupByHabit(query.data ?? []), [query.data]);

  const mutation = useMutation({
    mutationFn: async (v: { habitId: number; completed: boolean }) => {
      if (v.completed) {
        await deleteHabitCompletion(v.habitId, today);
      } else {
        await createHabitCompletion(v.habitId, today);
      }
    },
    onMutate: async (v) => {
      await queryClient.cancelQueries({ queryKey: COMPLETIONS_KEY });
      const previous = queryClient.getQueryData<HabitCompletion[]>(COMPLETIONS_KEY);

      queryClient.setQueryData<HabitCompletion[]>(COMPLETIONS_KEY, (old = []) =>
        v.completed
          ? old.filter(
              (c) => !(c.habitId === v.habitId && c.date.slice(0, 10) === today),
            )
          : [...old, { id: -v.habitId, habitId: v.habitId, date: today }],
      );

      return { previous };
    },
    onError: (_error, _v, context) => {
      queryClient.setQueryData(COMPLETIONS_KEY, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["completions"] }),
  });

  async function toggleHabit(habit: Habit) {
    if (pending.current.has(habit.id)) return;
    pending.current.add(habit.id);

    try {
      await mutation.mutateAsync({
        habitId: habit.id,
        completed: isCompletedToday(habit.id, completions, today),
      });
      setActionError(null);
    } catch {
      setActionError("Couldn't update that habit. Try again.");
    } finally {
      pending.current.delete(habit.id);
    }
  }

  const completedHabitIds = useMemo(
    () =>
      new Set(
        habits
          .filter((habit) => isCompletedToday(habit.id, completions, today))
          .map((habit) => habit.id),
      ),
    [habits, completions, today],
  );

  return {
    completions,
    completedHabitIds,
    error: query.isError
      ? "Couldn't load your habits. Try refreshing."
      : actionError,
    toggleHabit,
  };
}
