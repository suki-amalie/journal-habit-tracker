import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";

import MarkdownContent from "./MarkdownContent";

interface Edit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

// Wraps the selection (or a placeholder) with before/after markers; toggles them off if already present.
function wrap(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): Edit {
  const selected = value.slice(start, end);

  if (
    selected.length >= before.length + after.length &&
    selected.startsWith(before) &&
    selected.endsWith(after)
  ) {
    const inner = selected.slice(before.length, selected.length - after.length);

    return {
      value: value.slice(0, start) + inner + value.slice(end),
      selectionStart: start,
      selectionEnd: start + inner.length,
    };
  }

  const text = selected || placeholder;

  return {
    value: value.slice(0, start) + before + text + after + value.slice(end),
    selectionStart: start + before.length,
    selectionEnd: start + before.length + text.length,
  };
}

// Prefixes every line touched by the selection; removes the prefix if all lines already have it.
function prefixLines(
  value: string,
  start: number,
  end: number,
  prefix: (index: number) => string,
  detect: RegExp,
): Edit {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;

  const lines = value.slice(lineStart, lineEnd).split("\n");
  const allPrefixed = lines.every((line) => detect.test(line));

  const updated = lines
    .map((line, index) =>
      allPrefixed ? line.replace(detect, "") : prefix(index) + line.replace(detect, ""),
    )
    .join("\n");

  return {
    value: value.slice(0, lineStart) + updated + value.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + updated.length,
  };
}

interface Action {
  label: string;
  icon: LucideIcon;
  run: (value: string, start: number, end: number) => Edit;
}

const HEADING = /^#{1,6} /;

const actions: Action[] = [
  { label: "Bold (Ctrl+B)", icon: Bold, run: (v, s, e) => wrap(v, s, e, "**", "**", "bold text") },
  { label: "Italic (Ctrl+I)", icon: Italic, run: (v, s, e) => wrap(v, s, e, "*", "*", "italic text") },
  { label: "Strikethrough", icon: Strikethrough, run: (v, s, e) => wrap(v, s, e, "~~", "~~", "text") },
  { label: "Heading 1", icon: Heading1, run: (v, s, e) => prefixLines(v, s, e, () => "# ", HEADING) },
  { label: "Heading 2", icon: Heading2, run: (v, s, e) => prefixLines(v, s, e, () => "## ", HEADING) },
  { label: "Quote", icon: Quote, run: (v, s, e) => prefixLines(v, s, e, () => "> ", /^> /) },
  { label: "Bulleted list", icon: List, run: (v, s, e) => prefixLines(v, s, e, () => "- ", /^- (?!\[[ x]\] )/) },
  { label: "Numbered list", icon: ListOrdered, run: (v, s, e) => prefixLines(v, s, e, (i) => `${i + 1}. `, /^\d+\. /) },
  { label: "Task list", icon: ListChecks, run: (v, s, e) => prefixLines(v, s, e, () => "- [ ] ", /^- \[[ x]\] /) },
  { label: "Inline code", icon: Code, run: (v, s, e) => wrap(v, s, e, "`", "`", "code") },
  { label: "Link", icon: LinkIcon, run: (v, s, e) => wrap(v, s, e, "[", "](https://)", "link text") },
  { label: "Image", icon: ImageIcon, run: (v, s, e) => wrap(v, s, e, "![", "](https://)", "alt text") },
  {
    label: "Divider",
    icon: Minus,
    run: (v, s, e) => ({
      value: `${v.slice(0, s)}\n\n---\n\n${v.slice(e)}`,
      selectionStart: s + 7,
      selectionEnd: s + 7,
    }),
  },
];

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  onSubmit?: () => void;
}

function MarkdownEditor({
  value,
  onChange,
  rows = 10,
  placeholder,
  onSubmit,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function apply(action: Action) {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const edit = action.run(value, textarea.selectionStart, textarea.selectionEnd);

    onChange(edit.value);

    // Restore focus and selection after React re-renders the controlled value.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return;

    if (event.key === "Enter" && onSubmit) {
      event.preventDefault();
      onSubmit();
      return;
    }

    const key = event.key.toLowerCase();
    const action = key === "b" ? actions[0] : key === "i" ? actions[1] : null;

    if (action) {
      event.preventDefault();
      apply(action);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#ddd9d0] bg-[#fffefa] transition-colors focus-within:border-[#6B8FC4] focus-within:ring-1 focus-within:ring-[#6B8FC4]/40">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap gap-0.5 border-b border-[#ddd9d0] bg-[#f7f5ee] p-1.5"
      >
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.label}
            aria-label={action.label}
            onClick={() => apply(action)}
            className="rounded p-1.5 text-[#57606a] hover:bg-[#ebe8df] hover:text-[#292824]"
          >
            <action.icon size={16} />
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 md:divide-x md:divide-[#ddd9d0]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder={placeholder}
          aria-label="Markdown editor"
          className="min-h-48 w-full resize-y bg-transparent p-4 font-mono text-sm text-[#292824] focus:outline-none"
        />

        <div
          aria-label="Live preview"
          className="min-h-48 overflow-auto border-t border-[#ddd9d0] p-4 md:border-t-0"
        >
          {value.trim() === "" ? (
            <p className="text-sm text-[#a09c92]">Live preview appears here.</p>
          ) : (
            <MarkdownContent content={value} />
          )}
        </div>
      </div>
    </div>
  );
}

export default MarkdownEditor;
