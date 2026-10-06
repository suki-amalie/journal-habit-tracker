import { useState } from "react";

import { useToast } from "../hooks/useToast";
import type { JournalEntry } from "../types/journal";
import { formatTime } from "../utils/journal";
import MarkdownContent from "./MarkdownContent";
import MarkdownEditor from "./MarkdownEditor";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (id: number, content: string) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

// One entry with inline edit and delete, shared by the Write and History pages.
function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const [editing, setEditing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [draft, setDraft] = useState("");
  const toast = useToast();

  async function save() {
    if (draft.trim() === "") return;

    if (await onEdit(entry.id, draft.trim())) setEditing(false);
  }

  // The entry is hidden right away and only deleted for real once the undo window ends.
  function remove() {
    setPendingDelete(true);
    toast.show({
      message: "Entry deleted",
      onUndo: () => setPendingDelete(false),
      onCommit: async () => {
        if (!(await onDelete(entry.id))) {
          setPendingDelete(false);
          toast.show({ message: "Couldn't delete that entry." });
        }
      },
    });
  }

  if (pendingDelete) return null;

  return (
    <li className="rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-4">
      <p className="text-xs text-[#716f68]">{formatTime(entry.createdAt)}</p>

      {editing ? (
        <>
          <MarkdownEditor value={draft} onChange={setDraft} rows={5} onSubmit={save} />
          <div className="mt-2 flex justify-end gap-4 text-sm">
            <button type="button" onClick={() => setEditing(false)} className="text-[#716d63]">
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={draft.trim() === ""}
              className="text-[#4F8A47] disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-1">
            <MarkdownContent content={entry.content} />
          </div>
          <div className="mt-3 flex justify-end gap-4 text-sm text-[#716d63]">
            <button
              type="button"
              onClick={() => {
                setDraft(entry.content);
                setEditing(true);
              }}
              className="hover:text-[#292824]"
            >
              Edit
            </button>
            <button type="button" onClick={remove} className="text-[#a0524a] hover:text-[#76534d]">
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default JournalEntryCard;
