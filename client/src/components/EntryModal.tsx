import { useEffect, useRef } from "react";

import MarkdownEditor from "./MarkdownEditor";

interface EntryModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
  saveLabel?: string;
  hint?: string;
  notice?: string;
  onDiscard?: () => void;
}

function EntryModal({
  open,
  title,
  onClose,
  content,
  onChange,
  onSave,
  saving,
  error,
  saveLabel = "Save entry",
  hint = "Ctrl+Enter to save · Esc to close",
  notice,
  onDiscard
}: EntryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      const textarea = dialog.querySelector("textarea");
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function handleDiscard() {
    if (window.confirm("Discard your changes? This can't be undone.")) {
      onDiscard?.();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onMouseDown={(e) => {
        pressedOnBackdrop.current = e.target === dialogRef.current;
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current && pressedOnBackdrop.current) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto rounded-lg border border-[#d8d2c6] bg-[#fffefa] p-0 shadow-xl backdrop:bg-black/40"
    >
      {open && (
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#292824]">{title}</h2>
            {notice && (
              <span className="text-xs text-[#716d63]">{notice}</span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-[#716d63] hover:text-[#292824]"
            >
              ✕
            </button>
          </div>

          <MarkdownEditor
            value={content}
            onChange={onChange}
            onSubmit={onSave}
            rows={14}
            placeholder="What's on your mind?"
          />

          <div className="mt-3 flex items-center justify-end gap-4">
            {error ? (
              <span className="text-xs text-red-700">{error}</span>
            ) : (
              <span className="text-xs text-[#716d63]">{hint}</span>
            )}
            {onDiscard && (
              <button
                type="button"
                onClick={handleDiscard}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={saving || content.trim() === ""}
              className="rounded-md bg-[#292824] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : saveLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

export default EntryModal;