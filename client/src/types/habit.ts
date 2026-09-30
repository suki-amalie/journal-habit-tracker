export interface Habit {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  archivedAt: string | null;
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  date: string;
}