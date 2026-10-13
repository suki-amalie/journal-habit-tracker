import { useState } from "react";

// Persists text to localStorage immediately when the draft changes.
export function useDraft(key: string) {
  const [draft, setDraftState] = useState(() => {
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  });

  function setDraft(value: string) {
    // Update the UI immediately.
    setDraftState(value);

    // Persist the latest text before returning.
    try {
      if (value === "") {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // Storage unavailable (private mode / quota); persistence is best-effort.
    }
  }

  return [draft, setDraft] as const;
}