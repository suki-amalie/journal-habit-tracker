import { describe, expect, it } from "vitest";

import type { HabitCompletion } from "../types/habit";
import {
  getCompletionCountByDate,
  getCurrentStreak,
  isCompletedToday,
} from "./habit";

function completion(habitId: number, date: string, id = 1): HabitCompletion {
  return { id, habitId, date: `${date}T00:00:00.000Z` };
}

function days(...dates: string[]): HabitCompletion[] {
  return dates.map((date, index) => completion(1, date, index + 1));
}

describe("getCurrentStreak", () => {
  const today = "2026-10-06";

  it("is 0 with no completions", () => {
    expect(getCurrentStreak([], today)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(
      getCurrentStreak(days("2026-10-04", "2026-10-05", "2026-10-06"), today),
    ).toBe(3);
  });

  it("keeps the streak alive when today isn't done yet", () => {
    expect(getCurrentStreak(days("2026-10-04", "2026-10-05"), today)).toBe(2);
  });

  it("is 0 once a full day was missed", () => {
    expect(getCurrentStreak(days("2026-10-03", "2026-10-04"), today)).toBe(0);
  });

  it("stops at the first gap", () => {
    expect(
      getCurrentStreak(days("2026-10-01", "2026-10-05", "2026-10-06"), today),
    ).toBe(2);
  });

  it("crosses month and year boundaries", () => {
    expect(
      getCurrentStreak(
        days("2025-12-30", "2025-12-31", "2026-01-01"),
        "2026-01-01",
      ),
    ).toBe(3);
    expect(
      getCurrentStreak(days("2026-02-28", "2026-03-01"), "2026-03-01"),
    ).toBe(2);
  });

  it("handles leap days", () => {
    expect(
      getCurrentStreak(days("2024-02-28", "2024-02-29", "2024-03-01"), "2024-03-01"),
    ).toBe(3);
  });

  it("ignores duplicates and ordering", () => {
    expect(
      getCurrentStreak(
        days("2026-10-06", "2026-10-05", "2026-10-05", "2026-10-04"),
        today,
      ),
    ).toBe(3);
  });
});

describe("isCompletedToday", () => {
  it("checks only the given habit and date", () => {
    const completions = { 1: [completion(1, "2026-10-06")], 2: [] };

    expect(isCompletedToday(1, completions, "2026-10-06")).toBe(true);
    expect(isCompletedToday(1, completions, "2026-10-05")).toBe(false);
    expect(isCompletedToday(2, completions, "2026-10-06")).toBe(false);
    expect(isCompletedToday(3, completions, "2026-10-06")).toBe(false);
  });
});

describe("getCompletionCountByDate", () => {
  it("counts completions across habits per day", () => {
    const counts = getCompletionCountByDate({
      1: [completion(1, "2026-10-06", 1), completion(1, "2026-10-05", 2)],
      2: [completion(2, "2026-10-06", 3)],
    });

    expect(counts.get("2026-10-06")).toBe(2);
    expect(counts.get("2026-10-05")).toBe(1);
    expect(counts.get("2026-10-04")).toBeUndefined();
  });
});
