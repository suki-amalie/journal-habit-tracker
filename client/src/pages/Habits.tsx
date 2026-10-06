import { useState } from "react";

import AddHabitModal from "../components/AddHabitModal";
import ConfirmDialog from "../components/ConfirmDialog";
import HabitRow from "../components/HabitRow";
import { useHabits } from "../hooks/useHabits";
import { useToast } from "../hooks/useToast";
import { useHabitCompletions } from "../hooks/useHabitsCompletions";
import type { Habit } from "../types/habit";
import { getTodayDate } from "../utils/date";

type Tab = "active" | "archived";

function Habits() {
  const today = getTodayDate();

  const { habits, loading, error: habitsError, addHabit, editHabit, removeHabit } =
    useHabits("all");
  const { completions, completedHabitIds, error: completionsError, toggleHabit } =
    useHabitCompletions(habits);

  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState<Habit | null>(null);
  const toast = useToast();

  const error = habitsError ?? completionsError;
  const query = search.trim().toLowerCase();

  const visible = habits.filter(
    (habit) =>
      (habit.archivedAt === null) === (tab === "active") &&
      habit.name.toLowerCase().includes(query),
  );

  async function handleArchiveToggle(habit: Habit) {
    const archiving = habit.archivedAt === null;

    await editHabit(habit.id, { archived: archiving });
    toast.show({
      message: archiving ? `Archived "${habit.name}"` : `Restored "${habit.name}"`,
      onUndo: () => void editHabit(habit.id, { archived: !archiving }),
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#292824]">Habits</h1>
          <p className="mt-2 text-sm text-[#716D63]">
            Build consistency, one day at a time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md bg-[#4F8A47] px-4 py-2 text-sm font-medium text-white"
        >
          + Add habit
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-md border border-[#d8b8b3] bg-[#fbf5f3] px-4 py-3 text-sm text-[#76534d]">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="flex gap-4 text-sm">
          {(["active", "archived"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`-mb-px border-b-2 pb-2 capitalize ${
                tab === value
                  ? "border-[#292824] text-[#292824]"
                  : "border-transparent text-[#716d63]"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search habits"
          aria-label="Search habits"
          className="w-48 rounded-md border border-[#ddd9d0] bg-[#fffefa] px-3 py-1.5 text-sm outline-none focus:border-[#4F8A47]"
        />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-[#716d63]">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="mt-6 text-sm text-[#716d63]">
          {query
            ? "No habits match your search."
            : tab === "active"
              ? "No active habits yet. Add one to get started."
              : "No archived habits."}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {visible.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              completions={completions[habit.id] ?? []}
              today={today}
              completedToday={completedHabitIds.has(habit.id)}
              expanded={expandedId === habit.id}
              onToggleExpanded={() =>
                setExpandedId((current) => (current === habit.id ? null : habit.id))
              }
              onToggleCompletion={() => toggleHabit(habit)}
              onEdit={() => setEditing(habit)}
              onArchive={() => handleArchiveToggle(habit)}
              onDelete={() => setDeleting(habit)}
            />
          ))}
        </ul>
      )}

      {adding && (
        <AddHabitModal
          onClose={() => setAdding(false)}
          onAdd={async (name, description) => {
            setAdding(false);
            await addHabit(name, description);
          }}
        />
      )}

      {editing && (
        <AddHabitModal
          title="Edit habit"
          submitLabel="Save"
          initialName={editing.name}
          initialDescription={editing.description ?? ""}
          onClose={() => setEditing(null)}
          onAdd={async (name, description) => {
            const id = editing.id;
            setEditing(null);
            await editHabit(id, { name, description });
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete "${deleting.name}"?`}
          message="This permanently deletes the habit and all its history. Archive it instead if you may want it back."
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            const id = deleting.id;
            setDeleting(null);
            void removeHabit(id);
          }}
        />
      )}
    </div>
  );
}

export default Habits;
