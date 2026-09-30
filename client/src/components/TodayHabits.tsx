import { Plus } from "lucide-react";

import type { Habit } from "../types/habit";
import { GreenInkDrop } from "./InkDrops";

interface TodayHabitsProps {
  habits: Habit[];
  completedHabitIds: Set<number>;
  onToggle: (habit: Habit) => void;
  onAddHabit: () => void;
}

function TodayHabits({
  habits,
  completedHabitIds,
  onToggle,
  onAddHabit,
}: TodayHabitsProps) {
  return (
    <section className="lg:col-span-2 rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-6 sm:p-7">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#292824]">
            Today's habits
          </h2>

          <p className="mt-1 text-sm text-[#716f68]">
            Small actions, done consistently.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddHabit}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-[#716f68] transition hover:bg-[#eae7df] hover:text-[#292824]"
        >
          <Plus size={15} />
          Add habit
        </button>
      </div>

      <div className="divide-y divide-[#eae7df]">
        {habits.map((habit) => {
          const completed = completedHabitIds.has(habit.id);

          return (
            <div
              key={habit.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <button
                type="button"
                onClick={() => onToggle(habit)}
                aria-label={
                  completed
                    ? `Mark ${habit.name} as incomplete`
                    : `Mark ${habit.name} as complete`
                }
                className="group relative -mx-2 flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-left transition-colors duration-150 hover:bg-[#f3f1ea]"
              >
                <span className="relative inline-flex shrink-0 items-center">
                  {/* Dash line: short stub normally, extends to scratch off the name once completed */}
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none
                      absolute
                      left-0
                      top-1/2
                      h-px
                      -translate-y-1/2
                      bg-[#716f68]
                      transition-all
                      duration-300
                      ease-out
                      ${
                        completed
                          ? "w-full opacity-70"
                          : "w-4 opacity-40"
                      }
                    `}
                  />

                  <span
                    className={`
                      truncate
                      pl-7
                      text-sm
                      transition-colors
                      duration-150
                      ${
                        completed
                          ? "text-[#716f68]"
                          : "font-medium text-[#292824]"
                      }
                    `}
                  >
                    {habit.name}
                  </span>
                </span>

                {/* Green watercolor drop */}
                {completed && (
                  <span
                    className="relative flex h-5 w-5 shrink-0 items-center justify-center"
                  >
                    <GreenInkDrop size={22} />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TodayHabits;

