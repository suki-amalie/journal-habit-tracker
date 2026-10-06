import type { HabitCompletion } from "../types/habit";
import { addDays } from "./date";

export function isCompletedToday(
  habitId: number,
  completions: Record<number, HabitCompletion[]>,
  today: string,
): boolean {
  return (completions[habitId] ?? []).some(
    (completion) => completion.date.slice(0, 10) === today,
  );
}

// Consecutive days completed. A streak stays alive until today ends.
export function getCurrentStreak(
  completions: HabitCompletion[],
  today: string,
): number {
  const dates = new Set(completions.map((c) => c.date.slice(0, 10)));

  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;

  while (dates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function getCompletionCountByDate(
  completions: Record<number, HabitCompletion[]>,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const habitCompletions of Object.values(completions)) {
    for (const completion of habitCompletions) {
      const date = completion.date.slice(0, 10);

      counts.set(
        date,
        (counts.get(date) ?? 0) + 1,
      );
    }
  }

  return counts;
}