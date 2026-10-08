import { Check, ChevronDown } from "lucide-react";
import { useMemo } from "react";

import type { Habit, HabitCompletion } from "../types/habit";
import { getCurrentStreak } from "../utils/habit";
import ActivityHeatmap from "./ActivityHeatmap";

/** One habit on the Habits page: tick today, see streak, expand for yearly history and actions. */
interface HabitRowProps {
  habit: Habit;
  completions: HabitCompletion[];
  today: string;
  completedToday: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleCompletion: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

function HabitRow({
  habit,
  completions,
  today,
  completedToday,
  expanded,
  onToggleExpanded,
  onToggleCompletion,
  onEdit,
  onArchive,
  onDelete,
}: HabitRowProps) {
  const archived = habit.archivedAt !== null;
  const streak = getCurrentStreak(completions, today);

  const countsByDate = useMemo(
    () => new Map(completions.map((c) => [c.date.slice(0, 10), 1] as const)),
    [completions],
  );

  return (
    <li
      className={`rounded-xl border bg-[#fffefa] transition-shadow ${
        expanded ? "border-[#d8d0c2] shadow-[0_4px_16px_rgba(90,62,50,0.08)]" : "border-[#e6dfd2]"
      }`}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {!archived && (
          <button
            type="button"
            role="checkbox"
            aria-checked={completedToday}
            aria-label={`Mark ${habit.name} completed today`}
            onClick={onToggleCompletion}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
              completedToday
                ? "border-[#4F8A47] bg-[#4F8A47] text-white"
                : "border-[#c9bfae] text-transparent hover:border-[#4F8A47]"
            }`}
          >
            <Check size={14} strokeWidth={2.5} />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span
              className={`block truncate font-serif text-lg ${
                completedToday ? "text-[#8a867c]" : "text-[#292824]"
              }`}
            >
              {habit.name}
            </span>
            {habit.description && !expanded && (
              <span className="block truncate text-xs text-[#8a867c]">{habit.description}</span>
            )}
          </span>

          {streak > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#8a867c]">
              {streak} day{streak === 1 ? "" : "s"}
              {/* A pink dot celebrates streaks of 3+ days */}
              {streak >= 3 && (<span aria-label="Streak going" title="Nice streak!" className="h-2 w-2 rounded-full bg-drop-pink" />)}
            </span>
          )}

          <ChevronDown
            size={16}
            className={`shrink-0 text-[#8a867c] transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#efe9dc] px-5 pb-4 pt-4">
          {habit.description && (
            <p className="mb-4 text-sm text-[#716d63]">{habit.description}</p>
          )}

          <ActivityHeatmap
            title="History"
            description={`${completions.length} in the last year`}
            countsByDate={countsByDate}
            tooltip={(date, count) => `${date}: ${count ? "completed" : "not completed"}`}
            flat
          />

          <div className="mt-3 flex justify-end gap-5 text-sm text-[#8a867c]">
            <button type="button" onClick={onEdit} className="hover:text-[#292824]">
              Edit
            </button>
            <button type="button" onClick={onArchive} className="hover:text-[#292824]">
              {archived ? "Restore" : "Archive"}
            </button>
            <button type="button" onClick={onDelete} className="text-[#a0524a] hover:text-[#76534d]">
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default HabitRow;