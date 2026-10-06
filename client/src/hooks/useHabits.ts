import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createHabit,
  deleteHabit,
  getHabits,
  updateHabit,
  type HabitStatus,
} from "../services/habitService";
import type { Habit } from "../types/habit";

interface UseHabits {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  addHabit: (name: string, description: string | null) => Promise<void>;
  editHabit: (
    id: number,
    patch: { name?: string; description?: string | null; archived?: boolean },
  ) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
}

const EMPTY: Habit[] = [];

export function useHabits(status: HabitStatus = "active"): UseHabits {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["habits", status],
    queryFn: () => getHabits(status),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["habits"] });

  const create = useMutation({
    mutationFn: (v: { name: string; description: string | null }) =>
      createHabit(v.name, v.description),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: (v: {
      id: number;
      patch: { name?: string; description?: string | null; archived?: boolean };
    }) => updateHabit(v.id, v.patch),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteHabit(id),
    onSuccess: async () => {
      await refresh();
      await queryClient.invalidateQueries({ queryKey: ["completions"] });
    },
  });

  async function run(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      setActionError(null);
    } catch {
      setActionError(message);
    }
  }

  return {
    habits: query.data ?? EMPTY,
    loading: query.isPending,
    error: query.isError
      ? "Couldn't load your habits. Try refreshing."
      : actionError,
    addHabit: (name, description) =>
      run(() => create.mutateAsync({ name, description }), "Couldn't add that habit."),
    editHabit: (id, patch) =>
      run(() => update.mutateAsync({ id, patch }), "Couldn't update that habit."),
    removeHabit: (id) =>
      run(() => remove.mutateAsync(id), "Couldn't delete that habit."),
  };
}
