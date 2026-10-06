import { apiClient } from "./apiClient";
import type { Habit, HabitCompletion } from "../types/habit";

// Keep in sync with HABIT_STATUSES in server/src/validation/schemas.ts.
export type HabitStatus = "active" | "archived" | "all";

export async function getHabits(
  status: HabitStatus = "active",
): Promise<Habit[]> {
  const response = await apiClient(`/habits?status=${status}`);

  return response.json();
}

export async function updateHabit(
  id: number,
  patch: { name?: string; description?: string | null; archived?: boolean },
): Promise<Habit> {
  const response = await apiClient(`/habits/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  return response.json();
}

export async function deleteHabit(id: number): Promise<void> {
  await apiClient(`/habits/${id}`, { method: "DELETE" });
}

export async function createHabit(
  name: string,
  description: string | null,
): Promise<Habit> {
  const response = await apiClient(`/habits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });
  return response.json();
}

export async function getHabitCompletions(
  habitId: number,
): Promise<HabitCompletion[]> {
  const response = await apiClient(`/habits/${habitId}/completions`);

  return response.json();
}

export async function getAllHabitCompletions(range?: {
  from?: string;
  to?: string;
}): Promise<HabitCompletion[]> {
  const params = new URLSearchParams();

  if (range?.from) params.set("from", range.from);
  if (range?.to) params.set("to", range.to);

  const query = params.toString();
  const response = await apiClient(
    `/habits/completions${query ? `?${query}` : ""}`,
  );

  return response.json();
}

export async function createHabitCompletion(
  habitId: number,
  date: string,
): Promise<HabitCompletion> {
  const response = await apiClient(`/habits/${habitId}/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date }),
  });
  return response.json();
}

export async function deleteHabitCompletion(habitId: number, date: string) {
  await apiClient(`/habits/${habitId}/completions/${date}`, {
    method: "DELETE",
  });
}
