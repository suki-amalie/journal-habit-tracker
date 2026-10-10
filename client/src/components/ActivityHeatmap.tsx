import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  getDaysInYear,
  getMondayFirstWeekday,
  getMonthWeekPositions,
  getTodayDate,
} from "../utils/date";

import { HABIT_COLORS } from "./heatmapColors";

/**
 * Yearly activity grid (GitHub-style). Layout variants:
 * - default: horizontal weeks with month labels
 * - `vertical`: twelve mini month grids, good for narrow side panels
 * - `compact`: smaller cells; `flat`: no outer card chrome
 * - `monthColumns`: Tailwind grid-cols class for the vertical layout
 */
interface ActivityHeatmapProps {
  title: string;
  description: string;
  countsByDate: Map<string, number>;
  tooltip: (date: string, count: number) => string;
  colors?: string[];
  footerLink?: { to: string; label: string };
  onYearChange?: (year: number) => void;
  minYear?: number;
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  compact?: boolean;
  vertical?: boolean;
  flat?: boolean;
  smallCells?: boolean;
  monthColumns?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ActivityHeatmap({
  title,
  description,
  countsByDate,
  tooltip,
  colors = HABIT_COLORS,
  footerLink,
  onYearChange,
  minYear = 0,
  selectedDate,
  onSelectDate,
  compact = false,
  vertical = false,
  flat = false,
  smallCells = false,
  monthColumns = "grid-cols-3",
}: ActivityHeatmapProps) {
  const todayDate = getTodayDate();
  const currentYear = Number(todayDate.slice(0, 4));
  const [year, setYear] = useState(currentYear);

  function changeYear(next: number) {
    setYear(next);
    onYearChange?.(next);
  }

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
    <section className={`${flat ? "" : "rounded-lg border border-[#ddd9d0] bg-[#fffefa]"} ${vertical ? "flex h-full flex-col" : ""} ${flat ? "" : compact ? "p-3" : "p-6 sm:p-7"}`}>
      {/* Header */}
      <div className={`${compact ? "mb-2" : "mb-6"} flex flex-wrap items-center justify-between gap-1`}>
        <div>
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <p className={`mt-1 text-sm text-[#57606a] ${compact ? "hidden" : ""}`}>
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Previous year */}
          <button
            type="button"
            onClick={() => changeYear(year - 1)}
            disabled={year <= minYear}
            className="rounded-md p-1.5 text-[#57606a] hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c959f]"
            aria-label="Previous year"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="px-2 font-sans font-medium">
            {year}
          </span>

          {/* Next year */}
          <button
            type="button"
            onClick={() => changeYear(year + 1)}
            disabled={year >= currentYear}
            className="rounded-md p-1.5 text-[#57606a] hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c959f]"
            aria-label="Next year"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {vertical ? (
        <div className={`grid gap-x-2 gap-y-2 ${monthColumns}`}>
          {MONTHS.map((name, i) => {
            const month = i + 1;
            const prefix = `${year}-${String(month).padStart(2, "0")}-`;
            const days = dates.filter((d) => d.startsWith(prefix));
            const offset = getMondayFirstWeekday(year, month, 1);

            return (
              <div key={name}>
                <p className="mb-1 text-[10px] font-medium text-[#57606a]">{name}</p>
                <div
                  className={`grid ${
                    smallCells
                      ? "grid-cols-[repeat(7,16px)] gap-px"
                      : "grid-cols-7 gap-[1px]"
                  }`}
                >
                  {Array.from({ length: offset }, (_, k) => (
                    <div
                      key={`o${k}`}
                      className={smallCells ? "h-3 w-9" : "aspect-square"}
                    />
                  ))}
                  {days.map((date) => {
                    const count = countsByDate.get(date) ?? 0;
                    const intensity = colors[Math.min(count, colors.length - 1)];
                    const selected = selectedDate === date;
                    const ring = selected
                      ? "ring-1 ring-[#6b8fc4]"
                      : date === todayDate
                        ? "ring-1 ring-[#8c959f]"
                        : "";
                    const cellSize = smallCells
                      ? "h-3 w-3"
                      : "aspect-square";

                    if (onSelectDate && count > 0) {
                      return (
                        <button
                          key={date}
                          type="button"
                          title={tooltip(date, count)}
                          aria-label={tooltip(date, count)}
                          aria-pressed={selected}
                          onClick={() => onSelectDate(date)}
                          className={`${cellSize} cursor-pointer rounded-[2px] ${intensity} ${ring || "hover:ring-1 hover:ring-[#8c959f]"}`}
                        />
                      );
                    }

                    return (
                      <div
                        key={date}
                        title={tooltip(date, count)}
                        className={`${cellSize} rounded-[2px] ${intensity} ${ring}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      <>
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
                          countsByDate.get(date) ?? 0;

                        const intensity =
                          colors[Math.min(count, colors.length - 1)];

                        if (onSelectDate && count > 0) {
                          return (
                            <button
                              key={dayIndex}
                              type="button"
                              title={tooltip(date, count)}
                              aria-label={tooltip(date, count)}
                              aria-pressed={selectedDate === date}
                              onClick={() => onSelectDate(date)}
                              className={`h-3 w-3 cursor-pointer rounded-[2px] ${intensity} ${
                                selectedDate === date
                                  ? "ring-2 ring-[#292824] ring-offset-1"
                                  : "hover:ring-2 hover:ring-[#8c959f]"
                              }`}
                            />
                          );
                        }

                        return (
                          <div
                            key={dayIndex}
                            title={tooltip(date, count)}
                            className={`h-3 w-3 rounded-[2px] ${intensity} ${
                              selectedDate === date
                                ? "ring-2 ring-[#292824] ring-offset-1"
                                : ""
                            }`}
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
          <div
            aria-label="Activity intensity: less to more"
            className={`${compact ? "mt-2" : "mt-4"} flex items-center justify-end gap-1.5 text-[10px] text-[#8a867c]`}
          >
            <span>Less</span>

            {colors.map((className) => (
              <span
                key={className}
                className={`h-2.5 w-2.5 rounded-[2px] ${className}`}
              />
            ))}

            <span>More</span>
          </div>
        </div>
        {footerLink && (
          <div className="mt-4 text-right">
            <Link to={footerLink.to} className="text-sm text-blue-500 hover:underline">
              {footerLink.label}
            </Link>
          </div>
        )}
      </div>
      </>
      )}
      {vertical && footerLink && (
        <div className="mt-3 text-right">
          <Link to={footerLink.to} className="text-xs text-[#716f68] hover:text-[#292824]">
            {footerLink.label} →
          </Link>
        </div>
      )}
    </section>
  );
}

export default ActivityHeatmap;