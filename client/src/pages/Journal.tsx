import { useEffect, useState } from "react";

import JournalDayBook from "../components/JournalDayBook";
import NewEntryModal from "../components/EntryModal";
import { useDraft } from "../hooks/useDraft";
import { useJournalEntries } from "../hooks/useJournalEntries";
import { getTodayDate } from "../utils/date";

function Journal() {
  const today = getTodayDate();
  const todayEntries = useJournalEntries(today);

  const [content, setContent] = useDraft("journal:new-entry-draft");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSave() {
    if (saving || content.trim() === "") return;

    setSaving(true);
    const saved = await todayEntries.addEntry(content.trim());
    setSaving(false);

    if (saved) {
      setContent("");
      setModalOpen(false);
    }
  }

  // Press N anywhere (outside a text field) to start writing
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "n" || e.ctrlKey || e.metaKey || e.altKey)
        return;
      if (
        (e.target as HTMLElement).closest(
          "input, textarea, [contenteditable='true']",
        )
      )
        return;

      e.preventDefault();
      setModalOpen(true);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const hasDraft = content.trim() !== "";

  const writeLine = (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="mt-2 w-full border-t border-dashed border-[#d8d2c6] py-5 text-left font-handwriting text-2xl text-[#aaa49a] hover:text-[#5A3E32]"
    >
      {hasDraft ? "Continue your draft..." : "Write something..."}
    </button>
  );

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col px-4 pb-4">
      <div className="mb-3 flex shrink-0 items-baseline justify-between">
        <h1 className="font-serif text-3xl text-[#292824]">
          Write
          <span className="text-drop-blue">.</span>
        </h1>
        <p className="text-sm text-[#716D63]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="min-h-0 flex-1">
        <JournalDayBook
          entries={todayEntries.entries}
          onEdit={todayEntries.editEntry}
          onDelete={todayEntries.removeEntry}
          footer={writeLine}
          startAtEnd
        />
      </div>
      <NewEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        content={content}
        onChange={setContent}
        onSave={handleSave}
        saving={saving}
        error={todayEntries.error}
        title="New Journal Entry"
      />
    </div>
  );
}

export default Journal;
