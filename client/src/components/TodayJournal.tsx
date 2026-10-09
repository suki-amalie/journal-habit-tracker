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
      ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} today · latest at ${formatTime(latest.createdAt)}`
      : "Nothing written yet today.";

  return (
    <section className="flex flex-col rounded-2xl border border-[#e6dfd2] bg-[#fffefa] p-5">
      <h2 className="font-serif text-xl  text-drop-blue">J
        <span className="text-[#292824]">ournal</span>

      </h2>
      <p className="mt-0.5 text-sm text-[#8a867c]">{status}</p>

      {!loading && !written && (
        <p className="mt-4 font-handwriting text-xl text-[#8a867c]">A blank page. Begin whenever you're ready.</p>
      )}

      {written && (
        <div className="relative mt-4 max-h-44 overflow-hidden text-sm">
          <MarkdownContent content={latest.content} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#fffefa] to-transparent"
          />
        </div>
      )}

      <Link to="/journal/write" className="mt-auto pt-5 text-sm text-[#5a3e32] hover:text-[#8b5d70]">
        {written ? "Add another entry" : "Start today's entry"} →
      </Link>
    </section>
  );
}

export default TodayJournal;