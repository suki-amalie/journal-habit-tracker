import { useState } from "react";

import { useJournalEntries } from "../hooks/useJournalEntries";
import { getTodayDate } from "../utils/date";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function Journal() {
  const today = getTodayDate();
  const { entries, loading, error, addEntry } = useJournalEntries(today);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (content.trim() === "") return;

    setSaving(true);
    const saved = await addEntry(content.trim());
    setSaving(false);

    if (saved) setContent("");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-serif text-3xl text-[#292824]">Write</h1>

      <p className="mt-2 text-sm text-[#716D63]">
        Capture what's on your mind, as often as you like.
      </p>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={8}
        placeholder="What's on your mind?"
        className="mt-8 w-full rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-4 text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#8c959f]"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || content.trim() === ""}
          className="rounded-md bg-[#292824] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save entry"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <h2 className="mt-10 text-lg font-semibold text-[#292824]">Today</h2>

      {loading ? (
        <p className="mt-3 text-sm text-[#716f68]">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-sm text-[#716f68]">No entries yet today.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {[...entries].reverse().map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-4"
            >
              <p className="text-xs text-[#716f68]">
                {formatTime(entry.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[#292824]">
                {entry.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Journal;
