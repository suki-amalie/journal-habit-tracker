import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getJournalActivity } from "../services/journalService";
import { getYearRange, toLocalDateString } from "../utils/date";

interface JournalActivity {
  countsByDate: Map<string, number>;
  error: string | null;
}

export function useJournalActivity(year: number): JournalActivity {
  const query = useQuery({
    queryKey: ["journal", "activity", year],
    queryFn: () => getJournalActivity(getYearRange(year)),
  });

  const countsByDate = useMemo(() => {
    const counts = new Map<string, number>();
    for (const iso of query.data ?? []) {
      const date = toLocalDateString(iso);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }
    return counts;
  }, [query.data]);

  return {
    countsByDate,
    error: query.isError ? "Couldn't load your journal activity." : null,
  };
}
