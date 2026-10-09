import { useState } from "react";

import AddHabitModal from "../components/AddHabitModal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import HabitRow from "../components/HabitRow";
import { useHabits } from "../hooks/useHabits";
import { useHotkey } from "../hooks/useHotkey";
import { useToast } from "../hooks/useToast";
import { useHabitCompletions } from "../hooks/useHabitsCompletions";
import type { Habit } from "../types/habit";
import { getTodayDate } from "../utils/date";
type Tab = "active" | "archived";

function Habits() {
  const today = getTodayDate();

  const {
    habits,
    loading,
    error: habitsError,
    addHabit,
    editHabit,
    removeHabit,
  } = useHabits("all");
  const {
    completions,
    completedHabitIds,
    error: completionsError,
    toggleHabit,
  } = useHabitCompletions(habits);

  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState<Habit | null>(null);
  const toast = useToast();

  const error = habitsError ?? completionsError;
  const query = search.trim().toLowerCase();

  // "E" opens every heatmap, or closes them all if any are already open.
  useHotkey("e", () =>
    setExpandedIds((current) =>
      current.size > 0 ? new Set() : new Set(habits.map((habit) => habit.id)),
    ),
  );

  useHotkey("a", () =>
    setTab((current) => (current === "active" ? "archived" : "active")),
  );

  useHotkey("+", () => 
    setAdding(true),
  );

  const visible = habits.filter(
    (habit) =>
      (habit.archivedAt === null) === (tab === "active") &&
      habit.name.toLowerCase().includes(query),
  );

  async function handleArchiveToggle(habit: Habit) {
    const archiving = habit.archivedAt === null;

    await editHabit(habit.id, { archived: archiving });
    toast.show({
      message: archiving
        ? `Archived "${habit.name}"`
        : `Restored "${habit.name}"`,
      onUndo: () => void editHabit(habit.id, { archived: !archiving }),
    });
  }

  const activeCount = habits.filter((h) => h.archivedAt === null).length;
  const doneCount = habits.filter(
    (h) => h.archivedAt === null && completedHabitIds.has(h.id),
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#292824]">
            Habits
            <span className="text-drop-green">.</span>
          </h1>
          <p className="mt-1 text-sm text-[#8a867c]">
            {activeCount === 0
              ? "Build consistency, one day at a time."
              : `${doneCount} of ${activeCount} done today`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-full bg-[#5A3E32] px-5 py-2 text-sm font-medium text-[#F7F3EA] transition-colors hover:bg-[#4a3228]"
        >
          + New habit
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-[#d8b8b3] bg-[#fbf5f3] px-4 py-3 text-sm text-[#76534d]"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="inline-flex rounded-full bg-[#efe9dc] p-0.5 text-sm">
          {(["active", "archived"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-full px-4 py-1 capitalize transition-colors ${
                tab === value
                  ? "bg-[#fffefa] text-[#292824] shadow-sm"
                  : "text-[#8a867c] hover:text-[#292824]"
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
          className="w-52 rounded-full border border-[#e6dfd2] bg-[#fffefa] px-4 py-1.5 text-sm outline-none focus:border-[#5A3E32]"
        />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-[#8a867c]">Loading...</p>
      ) : visible.length === 0 ? (
        <EmptyState
          title={
            query
              ? "Nothing matches."
              : tab === "active"
                ? "A blank page."
                : "Nothing archived."
          }
          hint={
            query
              ? "Try a different search."
              : tab === "active"
                ? "Begin whenever you're ready."
                : undefined
          }
        />
      ) : (
        <ul className="mt-5 space-y-3">
          {visible.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              completions={completions[habit.id] ?? []}
              today={today}
              completedToday={completedHabitIds.has(habit.id)}
              expanded={expandedIds.has(habit.id)}
              onToggleExpanded={() =>
                setExpandedIds((current) => {
                  const next = new Set(current);
                  if (!next.delete(habit.id)) next.add(habit.id);
                  return next;
                })
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
