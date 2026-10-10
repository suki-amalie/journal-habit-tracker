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
      ? `${entries.length} ${
          entries.length === 1 ? "entry" : "entries"
        } today · latest at ${formatTime(latest.createdAt)}`
      : "Nothing written yet today.";

  return (
    <Link
      to="/journal"
      aria-label="Open journal"
      className="group flex flex-col rounded-2xl border border-[#e6dfd2] bg-[#fffefa] p-5 shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A7295] focus-visible:ring-offset-2"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        {/* Left: Decorative Journal heading */}
        <div className="flex shrink-0 justify-start">
          <div className="flex flex-col items-start rounded-xl py-1 pr-2">
            <div className="flex flex-col items-start">
              <div className="my-0.5 flex items-baseline tracking-tight">
                <span
                  className="origin-bottom-left text-5xl font-normal leading-none text-[#4A7295] transition-transform duration-200 ease-out group-hover:scale-110"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                  }}
                >
                  J
                </span>

                <span
                  className="text-2xl font-normal italic tracking-tight text-[#292824]"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                  }}
                >
                  ournal
                </span>
              </div>

              {/* Dot expands with the heading on hover */}
              <div className="flex w-[3.1rem] justify-center">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[#4A7295] transition-transform duration-200 ease-out group-hover:scale-150"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Journal status, latest entry, and navigation cue */}
        <div className="flex flex-1 flex-col">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6f6a60]">
            {status}
          </p>

          {!loading && !written && (
            <p className="mt-4 font-handwriting text-xl leading-relaxed text-[#777166]">
              A blank page. Begin whenever you're ready.
            </p>
          )}

          {!loading && written && (
            <div className="relative mt-3 max-h-36 overflow-hidden text-sm">
              <MarkdownContent content={latest.content} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#fffefa] to-transparent"
              />
            </div>
          )}

          {!loading && (
            <p className="mt-3 self-start text-sm text-[#4A7295]">
              {written ? "Continue writing" : "Write an entry"}
              <span
                aria-hidden="true"
                className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default TodayJournal;
