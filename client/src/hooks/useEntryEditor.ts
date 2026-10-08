import { useState } from "react";

import type { JournalEntry } from "../types/journal";

// localStorage drafts are best-effort: storage can be unavailable (private mode, quota).
const KEY_PREFIX = "journal:edit-draft:";

function readDraft(entry: JournalEntry): string | null {
  try {
    return localStorage.getItem(KEY_PREFIX + entry.id);
  } catch {
    return null;
  }
}

function writeDraft(entryId: number, content: string): void {
  try {
    localStorage.setItem(KEY_PREFIX + entryId, content);
  } catch (e) {
    console.warn("Failed to save draft to localStorage:", e);
  }
}

function clearDraft(entryId: number): void {
  try {
    localStorage.removeItem(KEY_PREFIX + entryId);
  } catch {
    console.warn("Failed to clear draft from localStorage.");
  }
}

/**
 * State machine for editing a journal entry in a modal.
 * Unsaved edits are mirrored to localStorage so a refresh or accidental
 * close does not lose them; the draft is cleared on save, discard or revert.
 */
export function useEntryEditor(
  onSave: (entryId: number, content: string) => Promise<boolean>,
) {
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  function startEditing(entry: JournalEntry) {
    const saved = readDraft(entry);
    setDraft(saved ?? entry.content);
    setRestored(saved !== null && saved !== entry.content);
    setError(null);
    setEditing(entry);
  }

  function changeDraft(content: string) {
    setDraft(content);
    if (!editing) return;
    if (content === editing.content) {
      clearDraft(editing.id);
    } else {
      writeDraft(editing.id, content);
    }
  }

  function close() {
    setEditing(null);
  }

  function discard() {
    if (!editing) return;

    clearDraft(editing.id);
    setDraft(editing.content);
    setRestored(false);
  }

  async function save() {
    if (!editing || saving || draft.trim() === "") {
      return;
    }
    setSaving(true);
    const ok = await onSave(editing.id, draft.trim());
    setSaving(false);
    if (ok) {
      clearDraft(editing.id);
      setEditing(null);
      setError(null);
    } else {
      setError("Failed to save entry.");
    }
  }

  const dirty = editing !== null && draft !== editing.content;

  return {
    editing,
    draft,
    changeDraft,
    saving,
    error,
    restored,
    dirty,
    startEditing,
    close,
    save,
    discard,
  };
}
