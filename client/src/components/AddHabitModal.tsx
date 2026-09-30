import { useState } from "react";

interface AddHabitModalProps {
  onClose: () => void;
  onAdd: (name: string, description: string | null) => void;
}

function AddHabitModal({
  onClose,
  onAdd,
}: AddHabitModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) return;

    onAdd(
      trimmedName,
      description.trim() || null,
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-[#D8D0C2] bg-[#FFFCF5] p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[#292824]">
          New habit
        </h2>

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="habit-name"
            className="text-sm text-[#716D63]"
          >
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
              focus:border-[#4F8A47]
            "
          />

          <label
            htmlFor="habit-description"
            className="mt-5 block text-sm text-[#716D63]"
          >
            Description
            <span className="ml-1 text-[#AAA69D]">
              (optional)
            </span>
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
              focus:border-[#4F8A47]
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
                bg-[#4F8A47]
                px-4
                py-2
                text-sm
                font-medium
                text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Add habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHabitModal;