import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ActivityHeatmap from "../components/ActivityHeatmap";
import { JOURNAL_COLORS } from "../components/heatmapColors";
import JournalEntryCard from "../components/JournalEntryCard";
import { useJournalActivity } from "../hooks/useJournalActivity";
import { useJournalEntries } from "../hooks/useJournalEntries";
import { getTodayDate } from "../utils/date";

function formatLongDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function JournalHistory() {
  const today = getTodayDate();
  const [searchParams] = useSearchParams();

  // Only same-year dates are accepted: the heatmap opens on the current year.
  const requested = searchParams.get("date");
  const initialDate =
    requested !== null &&
    /^\d{4}-\d{2}-\d{2}$/.test(requested) &&
    requested.startsWith(today.slice(0, 4)) &&
    requested <= today
      ? requested
      : today;

  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const { countsByDate, error: activityError } = useJournalActivity(year);
  const { entries, loading, error, editEntry, removeEntry } =
    useJournalEntries(selectedDate);

  // Keep the selected day's cell in sync after edits/deletes without refetching.
  const heatmapCounts = useMemo(() => {
    const counts = new Map(countsByDate);

    if (!loading && selectedDate.startsWith(String(year))) {
      if (entries.length > 0) counts.set(selectedDate, entries.length);
      else counts.delete(selectedDate);
    }

    return counts;
  }, [countsByDate, entries, loading, selectedDate, year]);

  return (
    <div className="mx-auto max-w-4xl px-6 pb-10">
      <h1 className="font-serif text-3xl text-[#292824]">History</h1>
      <p className="mt-2 text-sm text-[#716D63]">Your year in reflection.</p>

      <div className="mt-8">
        <ActivityHeatmap
          title="Journal activity"
          description="Select a day to read what you wrote"
          countsByDate={heatmapCounts}
          colors={JOURNAL_COLORS}
          tooltip={(date, count) =>
            `${date}: ${count} journal ${count === 1 ? "entry" : "entries"}`
          }
          onYearChange={setYear}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
          }}
        />
      </div>

      {(activityError || error) && (
        <p role="alert" className="mt-6 rounded-md border border-[#d8b8b3] bg-[#fbf5f3] px-4 py-3 text-sm text-[#76534d]">
          {activityError ?? error}
        </p>
      )}

      <h2 className="mt-10 text-lg font-semibold text-[#292824]">
        {formatLongDate(selectedDate)}
      </h2>

      {loading ? (
        <p className="mt-3 text-sm text-[#716f68]">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-sm text-[#716f68]">No entries on this day.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} onEdit={editEntry} onDelete={removeEntry} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default JournalHistory;
