import { Link } from "react-router-dom";

import type { JournalEntry } from "../types/journal";
import { formatTime } from "../utils/journal";
import MarkdownContent from "./MarkdownContent";

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
      ? `Written at ${formatTime(latest.createdAt)}`
      : "Nothing written yet today.";

  return (
    <section className="flex flex-col rounded-2xl border border-[#e6dfd2] bg-[#fffefa] p-5">
      <h2 className="font-serif text-xl text-[#292824]">Journal</h2>
      <p className="mt-0.5 text-sm text-[#8a867c]">{status}</p>

      {!loading && !written && (
        <p className="mt-4 font-handwriting text-xl text-[#8a867c]">A blank page. Begin whenever you're ready.</p>
      )}

      {written && (
        <div className="relative mt-4 max-h-36 overflow-hidden text-sm">
          <MarkdownContent content={latest.content} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#fffefa] to-transparent"
          />
        </div>
      )}

      <Link to="/journal/write" className="mt-auto pt-5 text-sm text-[#8a867c] hover:text-[#292824]">
        {written ? "Write more" : "Write today"} →
      </Link>
    </section>
  );
}

export default TodayJournal;