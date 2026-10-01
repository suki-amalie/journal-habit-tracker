import { useEffect, useState } from "react";

import { getHabits, createHabit } from "../services/habitService";
import type { Habit } from "../types/habit";

interface UseHabits {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  addHabit: (name: string, description: string | null) => Promise<void>;
}

export function useHabits(): UseHabits {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function addHabit(name: string, description: string | null) {
    try {
      const habit = await createHabit(name, description);
      setHabits((current) => [...current, habit]);
      setError(null);
    } catch {
      setError("Couldn't add that habit. Try again.");
    }
  }

  return { habits, loading, error, addHabit };
}
