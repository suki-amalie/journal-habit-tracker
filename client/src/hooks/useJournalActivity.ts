import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getFirstJournalActivity,
  getJournalActivity,
} from "../services/journalService";
import { getTodayDate, getYearRange, toLocalDateString } from "../utils/date";

interface JournalActivity {
  countsByDate: Map<string, number>;
  error: string | null;
  firstActivityYear: number;
}

export function useJournalActivity(year: number): JournalActivity {
  const query = useQuery({
    queryKey: ["journal", "activity", year],
    queryFn: () => getJournalActivity(getYearRange(year)),
  });
  const firstActivityQuery = useQuery({
    queryKey: ["journal", "activity", "first"],
    queryFn: getFirstJournalActivity,
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
    error:
      query.isError || firstActivityQuery.isError
        ? "Couldn't load your journal activity."
        : null,
    firstActivityYear: firstActivityQuery.data
      ? Number(toLocalDateString(firstActivityQuery.data).slice(0, 4))
      : Number(getTodayDate().slice(0, 4)),
  };
}
