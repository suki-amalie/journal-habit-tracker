
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  getDaysInYear,
  getMondayFirstWeekday,
  getMonthWeekPositions,
  getTodayDate,
} from "../utils/date";

interface HabitHeatmapProps {
  completionsByDate: Map<string, number>;
}

const INTENSITY_CLASSES = [
  "bg-[#eae7df]", // empty
  "bg-[#b7d1b0]", // light
  "bg-[#82b07a]", // medium
  "bg-[#5f9657]", // high
  "bg-[#3f7d3a]", // max
];

function getIntensityClass(count: number): string {
  return INTENSITY_CLASSES[Math.min(count, 4)];
}

function HabitHeatmap({
  completionsByDate,
}: HabitHeatmapProps) {
  const currentYear = Number(getTodayDate().slice(0, 4));
  const [year, setYear] = useState(currentYear);

  const dates = getDaysInYear(year);

  // Number of empty cells before January 1st.
  // Monday = 0, Tuesday = 1, ..., Sunday = 6.
  const firstDayOffset = getMondayFirstWeekday(
    year,
    1,
    1,
  );

  const cells = [
    ...Array(firstDayOffset).fill(null),
    ...dates,
  ];

  const weekCount = Math.ceil(cells.length / 7);
  const monthPositions = getMonthWeekPositions(year);

  return (
    <section className="rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-6 sm:p-7">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Habit activity
          </h2>

          <p className="mt-1 text-sm text-[#57606a]">
            Your habit activity throughout the year
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Previous year */}
          <button
            type="button"
            onClick={() =>
              setYear((current) => current - 1)
            }
            className="rounded-md p-1.5 text-[#57606a] hover:bg-[#f6f8fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c959f]"
            aria-label="Previous year"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="px-2 text-sm font-medium">
            {year}
          </span>

          {/* Next year */}
          <button
            type="button"
            onClick={() =>
              setYear((current) => current + 1)
            }
            disabled={year >= currentYear}
            className="rounded-md p-1.5 text-[#57606a] hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c959f]"
            aria-label="Next year"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          {/* Month labels */}
          <div className="relative mb-2 ml-8 h-4 text-xs text-[#57606a]">
            {monthPositions.map(({ month, weekIndex }) => (
              <span
                key={month}
                className="absolute"
                style={{
                  left: `${weekIndex * 16}px`,
                }}
              >
                {month}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Weekday labels: one slot per row so they line up with the grid rows below. */}
            <div className="flex w-7 flex-col gap-1 text-[10px] text-[#57606a]">
              {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((label, index) => (
                <span key={index} className="flex h-3 items-center">
                  {label}
                </span>
              ))}
            </div>

            {/* Calendar weeks */}
            <div className="flex gap-1">
              {Array.from(
                { length: weekCount },
                (_, weekIndex) => (
                  <div
                    key={weekIndex}
                    className="flex flex-col gap-1"
                  >
                    {Array.from(
                      { length: 7 },
                      (_, dayIndex) => {
                        const date =
                          cells[weekIndex * 7 + dayIndex];

                        // Empty cells before the first day
                        // of the year.
                        if (!date) {
                          return (
                            <div
                              key={dayIndex}
                              className="h-3 w-3"
                            />
                          );
                        }

                        const count =
                          completionsByDate.get(date) ?? 0;

                        const intensity =
                          getIntensityClass(count);

                        return (
                          <div
                            key={dayIndex}
                            title={`${date}: ${count} habit completions`}
                            className={`h-3 w-3 rounded-[2px] ${intensity}`}
                          />
                        );
                      },
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-[#57606a]">
            <span>Less</span>

            {INTENSITY_CLASSES.map((className) => (
              <span
                key={className}
                className={`h-3 w-3 rounded-[2px] ${className}`}
              />
            ))}

            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HabitHeatmap;
