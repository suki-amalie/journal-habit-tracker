import { useState } from "react";

/** Boolean state persisted to localStorage (e.g. collapsed sidebar). */
export function usePersistentToggle(key: string, initial = false) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initial : stored === "1";
    } catch {
      return initial;
    }
  });

  function toggle() {
    setValue((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {
        // storage unavailable; keep in-memory state only
      }
      return next;
    });
  }

  return [value, toggle] as const;
}