import { useState, useRef } from "react";

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (name: string, description: string | null) => void;
  title?: string;
  submitLabel?: string;
  initialName?: string;
  initialDescription?: string;
}

function AddHabitModal({
  onClose,
  onAdd,
  title = "New habit",
  submitLabel = "Add habit",
  initialName = "",
  initialDescription = "",
}: AddHabitModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) return;

    onAdd(trimmedName, description.trim() || null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-[#D8D0C2] bg-[#FFFCF5] p-6"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-xl font-semibold text-[#292824]">{title}</h2>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="habit-name" className="text-sm text-[#716D63]">
            Habit name
          </label>

          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Read for 20 minutes"
            autoFocus
            className="
              mt-2
              w-full
              rounded-md
              border
              border-[#D8D0C2]
              bg-[#F7F3EA]
              px-3
              py-2.5
              text-sm
              text-[#292824]
              outline-none
              focus:border-[#5A3E32]
            "
          />

          <label
            htmlFor="habit-description"
            className="mt-5 block text-sm text-[#716D63]"
          >
            Description
            <span className="ml-1 text-[#AAA69D]">(optional)</span>
          </label>

          <textarea
            id="habit-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A little more about this habit"
            rows={3}
            className="
              mt-2
              w-full
              resize-none
              rounded-md
              border
              border-[#D8D0C2]
              bg-[#F7F3EA]
              px-3
              py-2.5
              text-sm
              text-[#292824]
              outline-none
              focus:border-[#5A3E32]
            "
          />

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm text-[#716D63]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim()}
              className="
                rounded-md
                bg-[#5A3E32]
                px-4
                py-2
                text-sm
                font-medium
                text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHabitModal;
