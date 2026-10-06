import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import type { Habit, HabitCompletion } from "../types/habit";
import { getCurrentStreak } from "../utils/habit";
import ActivityHeatmap from "./ActivityHeatmap";

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
    () =>
      new Map(completions.map((c) => [c.date.slice(0, 10), 1] as const)),
    [completions],
  );

  return (
    <li className="rounded-lg border border-[#ddd9d0] bg-[#fffefa]">
      <div className="flex items-center gap-3 px-4 py-3">
        {!archived && (
          <input
            type="checkbox"
            checked={completedToday}
            onChange={onToggleCompletion}
            aria-label={`Mark ${habit.name} completed today`}
            className="h-4 w-4 cursor-pointer accent-[#4F8A47]"
          />
        )}

        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className={`truncate text-sm ${
              completedToday ? "text-[#716d63]" : "text-[#292824]"
            }`}
          >
            {habit.name}
          </span>

          <span className="ml-auto shrink-0 text-xs text-[#716d63]">
            {streak > 0 ? `${streak} day streak` : ""}
          </span>

          {expanded ? (
            <ChevronDown size={16} className="shrink-0 text-[#716d63]" />
          ) : (
            <ChevronRight size={16} className="shrink-0 text-[#716d63]" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#ece8df] px-4 py-4">
          {habit.description && (
            <p className="mb-4 text-sm text-[#716d63]">{habit.description}</p>
          )}

          <ActivityHeatmap
            title="History"
            description={`${completions.length} in the last year`}
            countsByDate={countsByDate}
            tooltip={(date, count) =>
              `${date}: ${count ? "completed" : "not completed"}`
            }
          />

          <div className="mt-4 flex justify-end gap-4 text-sm text-[#716d63]">
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
