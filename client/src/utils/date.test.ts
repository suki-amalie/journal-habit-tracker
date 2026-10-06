import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDateString,
  getDayRange,
  getDaysInYear,
  getMondayFirstWeekday,
  getMonthWeekPositions,
  getTodayDate,
  getYearRange,
  isLeapYear,
  toLocalDateString,
} from "./date";

describe("calendar helpers", () => {
  it("pads date strings", () => {
    expect(getDateString(2026, 3, 7)).toBe("2026-03-07");
  });

  it("detects leap years", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
  });

  it("lists every day of the year in order", () => {
    const days = getDaysInYear(2024);

    expect(days).toHaveLength(366);
    expect(days[0]).toBe("2024-01-01");
    expect(days[59]).toBe("2024-02-29");
    expect(days[365]).toBe("2024-12-31");
    expect(getDaysInYear(2026)).toHaveLength(365);
  });

  it("uses Monday as the first weekday", () => {
    // 2026-10-05 is a Monday, 2026-10-11 a Sunday.
    expect(getMondayFirstWeekday(2026, 10, 5)).toBe(0);
    expect(getMondayFirstWeekday(2026, 10, 11)).toBe(6);
  });

  it("places month labels on increasing week columns", () => {
    const positions = getMonthWeekPositions(2026);

    expect(positions).toHaveLength(12);
    expect(positions[0]?.weekIndex).toBe(0);

    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]!.weekIndex).toBeGreaterThan(positions[i - 1]!.weekIndex);
    }
  });
});

describe("range helpers", () => {
  it("covers exactly one local day", () => {
    const { from, to } = getDayRange("2026-10-05");

    expect(new Date(from).getTime()).toBe(new Date(2026, 9, 5).getTime());
    expect(new Date(to).getTime()).toBe(new Date(2026, 9, 6).getTime());
  });

  it("rolls over month and year ends", () => {
    expect(new Date(getDayRange("2026-12-31").to).getTime()).toBe(
      new Date(2027, 0, 1).getTime(),
    );
    expect(new Date(getDayRange("2026-01-31").to).getTime()).toBe(
      new Date(2026, 1, 1).getTime(),
    );
  });

  it("covers exactly one local year", () => {
    const { from, to } = getYearRange(2026);

    expect(new Date(from).getTime()).toBe(new Date(2026, 0, 1).getTime());
    expect(new Date(to).getTime()).toBe(new Date(2027, 0, 1).getTime());
  });

  it("has a day range contained by its year range", () => {
    const day = getDayRange("2026-06-15");
    const year = getYearRange(2026);

    expect(day.from >= year.from).toBe(true);
    expect(day.to <= year.to).toBe(true);
  });

  it("round-trips an instant inside a day back to that local date", () => {
    const { from, to } = getDayRange("2026-10-05");
    const middle = new Date((Date.parse(from) + Date.parse(to)) / 2).toISOString();

    expect(toLocalDateString(from)).toBe("2026-10-05");
    expect(toLocalDateString(middle)).toBe("2026-10-05");
    expect(toLocalDateString(to)).toBe("2026-10-06");
  });
});

describe("getTodayDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the local date in YYYY-MM-DD form", () => {
    vi.setSystemTime(new Date(2026, 9, 6, 23, 30));

    expect(getTodayDate()).toBe("2026-10-06");
  });
});
