import { useEffect, useState } from "react";

// Persists text to localStorage as the user types, so a refresh or crash doesn't lose it.
export function useDraft(key: string) {
  const [draft, setDraft] = useState(() => {
    try {
      return localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (draft === "") localStorage.removeItem(key);
        else localStorage.setItem(key, draft);
      } catch {
        // Storage unavailable (private mode / quota); autosave is best-effort.
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [key, draft]);

  return [draft, setDraft] as const;
}
