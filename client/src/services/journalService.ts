import { apiClient } from "./apiClient";
import type { JournalEntry } from "../types/journal";

export async function getJournalDates(): Promise<string[]> {
  const response = await apiClient("/journal");
  return response.json();
}

export async function getJournalEntry(
  date: string,
): Promise<JournalEntry | null> {
  const response = await apiClient(`/journal/${date}`);
  return response.json();
}

export async function createJournalEntry(
  date: string,
  content: string,
): Promise<JournalEntry> {
  const response = await apiClient("/journal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date,
      content,
    }),
  });

  return response.json();
}

export async function updateJournalEntry(
  date: string,
  content: string,
): Promise<JournalEntry> {
  const response = await apiClient(`/journal/${date}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });

  return response.json();
}