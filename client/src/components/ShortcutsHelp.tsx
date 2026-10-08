import { useEffect } from "react";

import { SHORTCUTS } from "./shortcuts";

interface ShortcutsHelpProps {
  onClose: () => void;
}

/** Modal cheat sheet listing every keyboard shortcut. */
function ShortcutsHelp({ onClose }: ShortcutsHelpProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="w-full max-w-md rounded-2xl border border-[#e6dfd2] bg-[#fffefa] p-6 shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="shortcuts-title" className="font-serif text-xl text-[#292824]">
          Keyboard shortcuts
        </h2>

        <ul className="mt-4 space-y-3">
          {SHORTCUTS.map(({ keys, description, scope }) => (
            <li key={description} className="flex items-center justify-between gap-4 text-sm">
              <span>
                <span className="text-[#292824]">{description}</span>
                <span className="ml-2 text-xs text-[#aaa49a]">{scope}</span>
              </span>
              <span className="flex shrink-0 gap-1">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded-md border border-[#d8d2c6] bg-[#f7f3ea] px-2 py-0.5 text-xs text-[#5A3E32]"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-right">
          <button type="button" onClick={onClose} className="text-sm text-[#716d63] hover:text-[#292824]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShortcutsHelp;