import { useEffect, useState } from "react";

interface UseBookNavigationProps {
  spreadCount: number;
  startAtEnd: boolean;
  entriesCount: number;
}

/**
 * Tracks which spread (pair of pages) of the journal book is open.
 * Resets when the number of entries changes, and supports ← / → keys.
 * `startAtEnd` opens the last spread (used by the Write page).
 */
export function useBookNavigation({
  spreadCount,
  startAtEnd,
  entriesCount,
}: UseBookNavigationProps) {
  const [override, setOverride] = useState<number | null>(null);
  const [prevEntriesCount, setPrevEntriesCount] = useState(entriesCount);

  // Reset override synchronously during render when entriesCount changes
  if (prevEntriesCount !== entriesCount) {
    setPrevEntriesCount(entriesCount);
    setOverride(null);
  }

  const last = spreadCount - 1;
  const current = Math.min(override ?? (startAtEnd ? last : 0), last);
  const hasPrevious = current > 0;
  const hasNext = current < last;

  // Handle arrow key page flips
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable='true']")) return;

      if (e.key === "ArrowLeft" && hasPrevious) setOverride(current - 1);
      if (e.key === "ArrowRight" && hasNext) setOverride(current + 1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, hasPrevious, hasNext]);

  return {
    current,
    hasPrevious,
    hasNext,
    goTo: setOverride,
    prevPage: () => setOverride(current - 1),
    nextPage: () => setOverride(current + 1),
  };
}