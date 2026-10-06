import { apiClient } from "./apiClient";
import type { JournalEntry } from "../types/journal";

interface TimeRange {
  from: string;
  to: string;
}

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

// Entries created in [from, to), oldest first.
export async function getJournalEntries({
  from,
  to,
}: TimeRange): Promise<JournalEntry[]> {
  const params = new URLSearchParams({ from, to });
  const response = await apiClient(`/journal?${params}`);

  return response.json();
}

// Creation timestamps only, for building activity heatmaps.
export async function getJournalActivity({
  from,
  to,
}: TimeRange): Promise<string[]> {
  const params = new URLSearchParams({ from, to });
  const response = await apiClient(`/journal/activity?${params}`);

  return response.json();
}

export async function createJournalEntry(
  content: string,
): Promise<JournalEntry> {
  const response = await apiClient("/journal", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ content }),
  });

  return response.json();
}

export async function updateJournalEntry(
  id: number,
  content: string,
): Promise<JournalEntry> {
  const response = await apiClient(`/journal/${id}`, {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify({ content }),
  });

  return response.json();
}

export async function deleteJournalEntry(id: number): Promise<void> {
  await apiClient(`/journal/${id}`, { method: "DELETE" });
}
