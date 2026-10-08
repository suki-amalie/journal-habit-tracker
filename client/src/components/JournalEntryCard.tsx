import { useState } from "react";

import { useToast } from "../hooks/useToast";
import type { JournalEntry } from "../types/journal";
import { formatTime } from "../utils/journal";
import MarkdownContent from "./MarkdownContent";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: number) => Promise<boolean>;
}

function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const [pendingDelete, setPendingDelete] = useState(false);
  const toast = useToast();

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
    <li className="group py-5">
      <p className="text-xs text-[#aaa49a]">{formatTime(entry.createdAt)}</p>

      <div className="mt-1">
        <MarkdownContent content={entry.content} />
      </div>

      <div className="mt-2 flex justify-end gap-4 text-sm text-[#716d63] transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="hover:text-[#292824]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={remove}
          className="text-[#a0524a] hover:text-[#76534d]"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
export default JournalEntryCard;