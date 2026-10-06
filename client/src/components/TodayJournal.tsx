import { Link } from "react-router-dom";

import type { JournalEntry } from "../types/journal";
import { getExcerpt } from "../utils/journal";

interface TodayJournalProps {
  entries: JournalEntry[];
  loading: boolean;
}

function TodayJournal({ entries, loading }: TodayJournalProps) {
  const latest = entries[entries.length - 1];
  const written = latest !== undefined;

  const status = loading
    ? "Loading..."
    : written
      ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} today`
      : "Nothing written yet today.";

  return (
    <section className="flex flex-col rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-6 sm:p-7">
      <h2 className="text-lg font-semibold text-[#292824]">Journal</h2>

      <p className="mt-1 text-sm text-[#716f68]">{status}</p>

      {written && (
        <p className="mt-4 text-sm leading-6 text-[#292824]">
          “{getExcerpt(latest.content)}”
        </p>
      )}

      <Link
        to="/journal/write"
        className="mt-auto pt-6 text-right text-sm text-[#716f68] hover:text-[#292824]"
      >
        {written ? "Write another" : "Write today"} →
      </Link>
    </section>
  );
}

export default TodayJournal;