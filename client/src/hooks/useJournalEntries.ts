import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
  updateJournalEntry,
} from "../services/journalService";
import type { JournalEntry } from "../types/journal";
import { getDayRange } from "../utils/date";

interface UseJournalEntries {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  addEntry: (content: string) => Promise<boolean>;
  editEntry: (id: number, content: string) => Promise<boolean>;
  removeEntry: (id: number) => Promise<boolean>;
}

const EMPTY: JournalEntry[] = [];

export function useJournalEntries(date: string): UseJournalEntries {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["journal", "entries", date],
    queryFn: () => getJournalEntries(getDayRange(date)),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["journal"] });

  const create = useMutation({ mutationFn: createJournalEntry, onSuccess: refresh });
  const update = useMutation({
    mutationFn: (v: { id: number; content: string }) =>
      updateJournalEntry(v.id, v.content),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: deleteJournalEntry, onSuccess: refresh });

  async function run(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      setActionError(null);
      return true;
    } catch {
      setActionError(message);
      return false;
    }
  }

  return {
    entries: query.data ?? EMPTY,
    loading: query.isPending,
    error: query.isError ? "Couldn't load your entries." : actionError,
    addEntry: (content) =>
      run(() => create.mutateAsync(content), "Couldn't save your entry."),
    editEntry: (id, content) =>
      run(() => update.mutateAsync({ id, content }), "Couldn't update your entry."),
    removeEntry: (id) =>
      run(() => remove.mutateAsync(id), "Couldn't delete your entry."),
  };
}
