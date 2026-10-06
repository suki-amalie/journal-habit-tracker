import { useState } from "react";

import JournalEntryCard from "../components/JournalEntryCard";
import MarkdownEditor from "../components/MarkdownEditor";
import { useDraft } from "../hooks/useDraft";
import { useJournalEntries } from "../hooks/useJournalEntries";
import { getTodayDate } from "../utils/date";

function Journal() {
  const today = getTodayDate();
  const { entries, loading, error, addEntry, editEntry, removeEntry } = useJournalEntries(today);
  const [content, setContent] = useDraft("journal:new-entry-draft");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saving || content.trim() === "") return;

    setSaving(true);
    const saved = await addEntry(content.trim());
    setSaving(false);

    if (saved) setContent("");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl text-[#292824]">Write</h1>

      <p className="mt-2 text-sm text-[#716D63]">
        Capture what's on your mind, as often as you like.
      </p>

      <div className="mt-8">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          onSubmit={handleSave}
          placeholder="What's on your mind?"
        />
      </div>

      <div className="mt-3 flex items-center justify-end gap-4">
        <span className="text-xs text-[#716d63]">
          Draft saved automatically · Ctrl+Enter to save
        </span>
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
            <JournalEntryCard key={entry.id} entry={entry} onEdit={editEntry} onDelete={removeEntry} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default Journal;
