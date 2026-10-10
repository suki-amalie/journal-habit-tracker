import { Link } from "react-router-dom";
import type { Habit } from "../types/habit";

interface TodayHabitsProps {
  habits: Habit[];
  completedHabitIds: Set<number>;
  maxItems?: number;
}

function TodayHabits({
  habits,
  completedHabitIds,
  maxItems = 3,
}: TodayHabitsProps) {
  const done = habits.filter((habit) => completedHabitIds.has(habit.id)).length;
  const visibleHabits = habits.slice(0, maxItems);

  return (
    <Link
      to="/habits"
      aria-label={`View all habits. ${done} of ${habits.length} completed today.`}
      className="group flex flex-col rounded-2xl border border-[#e6dfd2] bg-[#fffefa] p-5 shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A6E4F] focus-visible:ring-offset-2"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        {/* Left: Decorative Habits heading */}
        <div className="flex shrink-0 justify-start">
          <div className="flex flex-col items-start rounded-xl py-1 pr-2">
            <div className="flex flex-col items-start">
              <div className="my-0.5 flex items-baseline tracking-tight">
                <span
                  className="origin-bottom-left text-5xl font-normal leading-none text-[#5A6E4F] transition-transform duration-200 ease-out group-hover:scale-110"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                  }}
                >
                  H
                </span>

                <span
                  className="text-2xl font-normal italic tracking-tight text-[#292824]"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                  }}
                >
                  abits
                </span>
              </div>

              {/* Dot expands with the heading on hover */}
              <div className="flex w-[3.1rem] justify-center">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[#5A6E4F] transition-transform duration-200 ease-out group-hover:scale-150"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Progress tracker and habit preview */}
        <div className="flex flex-1 flex-col">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6f6a60]">
            {habits.length === 0
              ? "No habits yet."
              : `${done} of ${habits.length} completed today`}
          </p>

          {habits.length > 0 && (
            <div
              role="progressbar"
              aria-label="Today's habit completion"
              aria-valuemin={0}
              aria-valuemax={habits.length}
              aria-valuenow={done}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#efe9dc]"
            >
              <div
                className="h-full rounded-full bg-[#5A6E4F] transition-all duration-300"
                style={{ width: `${(done / habits.length) * 100}%` }}
              />
            </div>
          )}

          {habits.length === 0 ? (
            <p className="mt-4 font-handwriting text-xl leading-relaxed text-[#777166]">
              A blank page. Begin whenever you're ready.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {visibleHabits.map((habit) => {
                const completed = completedHabitIds.has(habit.id);

                return (
                  <li
                    key={habit.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        completed
                          ? "bg-[#5A6E4F]"
                          : "border border-[#b9b4a8] bg-transparent"
                      }`}
                    />

                    <span
                      className={`font-serif text-base leading-snug ${
                        completed
                          ? "text-[#8a867c] line-through decoration-[#b9b4a8]"
                          : "text-[#292824]"
                      }`}
                    >
                      {habit.name}
                    </span>

                    <span className="sr-only">
                      {completed ? "(done today)" : "(not done today)"}
                    </span>
                  </li>
                );
              })}

              {habits.length > maxItems && (
                <li className="pt-1 text-sm text-[#5A6E4F]">
                  +{habits.length - maxItems} more{" "}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </Link>
  );
}

export default TodayHabits;
