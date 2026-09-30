import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface DailyEntryProps {
  date: string;
  content: string;
  onSave: (content: string) => void;
}

function DailyEntry({
  date,
  content,
  onSave,
}: DailyEntryProps) {
  const [draft, setDraft] = useState(content);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  function handleSave() {
    onSave(draft);
    setEditing(false);
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#292824]">
            {date}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-[#716D63]"
        >
          Edit
        </button>
      </div>

      <div className="mt-6">
        {editing ? (
          <>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={15}
              className="w-full resize-none border border-[#D8D0C2] bg-[#FFFCF5] p-4 text-sm text-[#292824] outline-none"
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(content);
                  setEditing(false);
                }}
                className="px-3 py-2 text-sm text-[#716D63]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-[#4F8A47] px-4 py-2 text-sm text-white"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <article className="prose">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm text-[#AAA69D]"
              >
                Start writing...
              </button>
            )}
          </article>
        )}
      </div>
    </section>
  );
}

export default DailyEntry;