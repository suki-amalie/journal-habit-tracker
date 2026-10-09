import { useMemo, type ReactNode } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useEntryEditor } from "../hooks/useEntryEditor";
import { useBookNavigation } from "../hooks/useBookNavigation";
import type { JournalEntry } from "../types/journal";

import EmptyState from "./EmptyState";
import EntryModal from "./EntryModal";
import JournalEntryCard from "./JournalEntryCard";

/**
 * Open-book view of one day's journal entries.
 * Each entry gets its own page (long ones scroll inside the page); wide
 * screens show two pages per spread. Colored side tabs turn the spread:
 * blue looks back, pink looks ahead. `footer` renders as an extra final page
 * (the Write page uses it for the "Write something…" prompt).
 */
interface JournalDayBookProps {
  entries: JournalEntry[];
  onEdit: (id: number, content: string) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  footer?: ReactNode;
  startAtEnd?: boolean;
  height?: string;
}
function JournalDayBook({
  entries,
  onEdit,
  onDelete,
  footer,
  startAtEnd = false,
  height = "100%",
}: JournalDayBookProps) {
  const perSpread = useMediaQuery("(min-width: 800px)") ? 2 : 1;
  const editor = useEntryEditor(onEdit);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [entries]
  );

  // One entry per page (null = the write prompt); long entries scroll inside their page.
  const pages = useMemo<(JournalEntry | null)[]>(
    () => (footer ? [...sorted, null] : sorted),
    [sorted, footer]
  );

  const spreadCount = Math.max(Math.ceil(pages.length / perSpread), 1);
  const nav = useBookNavigation({ spreadCount, startAtEnd, entriesCount: entries.length });

  // The pages currently on show; `page` is undefined past the last entry.
  const firstIndex = nav.current * perSpread;
  const visible = Array.from({ length: perSpread }, (_, i) => ({
    index: firstIndex + i,
    page: pages[firstIndex + i],
  }));
  const firstPage = firstIndex + 1;
  const lastPage = Math.min(firstIndex + perSpread, pages.length);

  return (
    <>
      <div className="flex items-stretch" style={{ height, minHeight: 280 }}>

        <div
          className={`relative bg-[#fffefa] grid min-w-0 flex-1 overflow-hidden rounded-sm border border-[#d8d2c6] shadow-[0_4px_16px_rgba(41,40,36,0.08)] ${
            perSpread === 2 ? "grid-cols-2 divide-x divide-[#d8d2c6]" : "grid-cols-1"
          }`}
        >
          {visible.map(({ index, page }) => (
            <div key={`${nav.current}-${index}-${page?.id ?? "x"}`} className={`animate-page-in flex min-h-0 flex-col pb-9 pt-8 ${spreadCount > 1 ? "px-10 sm:px-12" : "px-6 sm:px-8"}`}>
              <div className="book-scroll min-h-0 flex-1 overflow-y-auto pr-1">
                {page ? (
                  <ul>
                    <JournalEntryCard entry={page} onEdit={editor.startEditing} onDelete={onDelete} />
                  </ul>
                ) : index === pages.length && pages.length > 0 ? null : footer ? (
                  footer
                ) : (
                  <EmptyState title="A blank page." hint="Nothing was written on this day." />
                )}
              </div>
            </div>
          ))}

          <NavButton direction="prev" onClick={nav.prevPage} disabled={!nav.hasPrevious} visible={spreadCount > 1} />
          <NavButton direction="next" onClick={nav.nextPage} disabled={!nav.hasNext} visible={spreadCount > 1} />

          {pages.length > 1 && (
            <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-[#aaa49a]">
              {firstPage === lastPage ? `Page ${firstPage}` : `Page ${firstPage}-${lastPage}`} of {pages.length}
            </p>
          )}
        </div>
      </div>
      <EntryModal
        open={editor.editing !== null}
        title="Edit entry"
        saveLabel="Save changes"
        hint="Ctrl+Enter to save · Esc to cancel"
        notice={editor.restored ? "Unsaved draft restored" : undefined}
        onClose={editor.close}
        content={editor.draft}
        onChange={editor.changeDraft}
        onSave={editor.save}
        onDiscard={editor.dirty ? editor.discard : undefined}
        saving={editor.saving}
        error={editor.error}
      />
    </>
  );
}
/** Book-edge tab that turns the spread: blue (left) = back, pink (right) = forward. */
function NavButton({
  direction,
  onClick,
  disabled,
  visible,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
  visible: boolean;
}) {
  if (!visible) return null;
  const prev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={prev ? "Previous pages" : "Next pages"}
      title={prev ? "Look back" : "Look ahead"}
      onClick={onClick}
      disabled={disabled}
      className={`group absolute top-1/2 z-10 flex h-24 w-6 -translate-y-1/2 items-center justify-center text-sm transition-all duration-200 disabled:invisible ${
        prev
          ? "left-0 rounded-r-lg bg-[#c9d8ee] text-[#3f5f94] hover:w-8 hover:bg-[#b5c9e8]"
          : "right-0 rounded-l-lg bg-[#F2B5C8] text-[#a64d6c] hover:w-8 hover:bg-[#ee9fb7]"
      }`}
    >
      <span className="transition-transform group-hover:scale-125">{prev ? "<" : ">"}</span>
    </button>
  );
}
export default JournalDayBook;