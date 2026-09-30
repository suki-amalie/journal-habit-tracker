import type { HabitCompletion } from "../types/habit";

export function isCompletedToday(
  habitId: number,
  completions: Record<number, HabitCompletion[]>,
  today: string,
): boolean {
  return (completions[habitId] ?? []).some(
    (completion) => completion.date.slice(0, 10) === today,
  );
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