import { apiClient } from "./apiClient";
import type { Habit, HabitCompletion } from "../types/habit";

export async function getHabits(): Promise<Habit[]> {
  const response = await apiClient("/habits");

  return response.json();
}

export async function createHabit(
    name: string, 
    description: string | null
): Promise<Habit>{
    const response = await apiClient(
        `/habits`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name, description }),
        }
    );
    return response.json();
}

export async function getHabitCompletions(
  habitId: number
): Promise<HabitCompletion[]> {
  const response = await apiClient(
    `/habits/${habitId}/completions`
  );

  return response.json();
}

export async function createHabitCompletion(
    habitId:number,
    date: string
): Promise<HabitCompletion> {
    const response = await apiClient(
        `/habits/${habitId}/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ date }),
        }
    );
    return response.json();
}


export async function deleteHabitCompletion(
  habitId: number,
  date: string
) {
  await apiClient(`/habits/${habitId}/completions/${date}`, {
    method: "DELETE",
  });
}