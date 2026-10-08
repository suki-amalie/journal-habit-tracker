import { useEffect, useRef } from "react";

/**
 * Runs `handler` when `key` is pressed on its own (no Ctrl/Alt/Meta).
 * Ignored while typing in inputs, textareas or the Markdown editor.
 * Keep the list of user-facing shortcuts in `components/shortcuts.ts` in sync.
 */
export function useHotkey(key: string, handler: () => void, enabled = true) {
  // Always call the latest handler without re-subscribing every render.
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      event.preventDefault();
      handlerRef.current();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, enabled]);
}