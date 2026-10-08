import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import ActivityHeatmap from "../components/ActivityHeatmap";
import JournalDayBook from "../components/JournalDayBook";
import { JOURNAL_COLORS } from "../components/heatmapColors";
import { useHotkey } from "../hooks/useHotkey";
import { usePersistentToggle } from "../hooks/usePersistentToggle";
import { useJournalActivity } from "../hooks/useJournalActivity";
import { useJournalEntries } from "../hooks/useJournalEntries";
import { getTodayDate } from "../utils/date";

function JournalHistory() {
  const today = getTodayDate();
  const [searchParams] = useSearchParams();
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

  const [calendarHidden, toggleCalendar] = usePersistentToggle("journal:calendar-hidden");
  useHotkey("c", toggleCalendar);
  const { countsByDate, error: activityError } = useJournalActivity(year);
  const { entries, loading, error, editEntry, removeEntry } =
    useJournalEntries(selectedDate);

  return (
    <div className="mx-auto flex h-full max-w-[1800px] flex-col px-4 pb-4 xl:px-8">
      {(activityError || error) && (
        <p
          role="alert"
          className="mb-2 shrink-0 rounded-md border border-[#d8b8b3] bg-[#fbf5f3] px-4 py-2 text-sm text-[#76534d]"
        >
          {activityError ?? error}
        </p>
      )}

      <div className="mb-3 flex shrink-0 items-end justify-between gap-3 px-1">
        <div>
          <h2 className="font-serif text-2xl leading-tight text-[#292824]">
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <p className="mt-0.5 text-xs text-[#aaa49a]">
            {loading
              ? "Loading..."
              : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedDate !== today && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="rounded-full border border-[#d8d2c6] bg-[#fffefa] px-3 py-1 text-xs text-[#716d63] shadow-sm transition-colors hover:text-[#292824]"
            >
              Back to today
            </button>
          )}
          <button
            type="button"
            onClick={toggleCalendar}
            aria-label={calendarHidden ? "Show activity calendar (C)" : "Hide activity calendar (C)"}
            title={calendarHidden ? "Show activity calendar (C)" : "Hide activity calendar (C)"}
            className="rounded-full border border-[#d8d2c6] bg-[#fffefa] p-1.5 text-[#716d63] shadow-sm transition-colors hover:text-[#292824]"
          >
            {calendarHidden ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="relative min-h-0 min-w-0 flex-1">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#fffefa]/70 backdrop-blur-[1px]">
              <p className="text-sm text-[#716f68]">Loading...</p>
            </div>
          )}

          <JournalDayBook entries={entries} onEdit={editEntry} onDelete={removeEntry} />
        </div>

        {!calendarHidden && (
          <aside className="w-64 shrink-0 self-start xl:w-72">
            <ActivityHeatmap
              compact
              vertical
              title="Journal activity"
              description="Select a day to read what you wrote"
              countsByDate={countsByDate}
              colors={JOURNAL_COLORS}
              tooltip={(date, count) =>
                `${date}: ${count} journal ${count === 1 ? "entry" : "entries"}`
              }
              onYearChange={setYear}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
export default JournalHistory;