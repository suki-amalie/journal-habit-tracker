// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as habitService from "../services/habitService";
import type { Habit } from "../types/habit";
import { getTodayDate } from "../utils/date";
import { useHabitCompletions } from "./useHabitsCompletions";

vi.mock("../services/habitService");

const service = vi.mocked(habitService);

const habit: Habit = {
  id: 1,
  name: "Read",
  description: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  archivedAt: null,
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useHabitCompletions([habit]), { wrapper });
}

beforeEach(() => {
  service.getAllHabitCompletions.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("useHabitCompletions optimistic toggle", () => {
  it("checks the habit before the server responds", async () => {
    let resolveCreate!: () => void;
    service.createHabitCompletion.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = () =>
          resolve({ id: 10, habitId: 1, date: getTodayDate() });
      }),
    );

    const { result } = setup();
    await waitFor(() => expect(service.getAllHabitCompletions).toHaveBeenCalled());

    let toggle!: Promise<void>;
    act(() => {
      toggle = result.current.toggleHabit(habit);
    });

    await waitFor(() => expect(result.current.completedHabitIds.has(1)).toBe(true));
    expect(service.createHabitCompletion).toHaveBeenCalledWith(1, getTodayDate());

    service.getAllHabitCompletions.mockResolvedValue([
      { id: 10, habitId: 1, date: getTodayDate() },
    ]);
    resolveCreate();
    await act(() => toggle);

    expect(result.current.completedHabitIds.has(1)).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("rolls back and reports an error when the request fails", async () => {
    service.createHabitCompletion.mockRejectedValue(new Error("boom"));

    const { result } = setup();
    await waitFor(() => expect(service.getAllHabitCompletions).toHaveBeenCalled());

    await act(() => result.current.toggleHabit(habit));

    await waitFor(() => expect(result.current.completedHabitIds.has(1)).toBe(false));
    expect(result.current.error).toBe("Couldn't update that habit. Try again.");
  });

  it("ignores a second toggle while one is in flight", async () => {
    service.createHabitCompletion.mockReturnValue(new Promise(() => {}));

    const { result } = setup();
    await waitFor(() => expect(service.getAllHabitCompletions).toHaveBeenCalled());

    act(() => {
      void result.current.toggleHabit(habit);
      void result.current.toggleHabit(habit);
    });

    await waitFor(() => expect(service.createHabitCompletion).toHaveBeenCalled());
    expect(service.createHabitCompletion).toHaveBeenCalledTimes(1);
  });

  it("unchecks a completed habit by deleting today's completion", async () => {
    service.getAllHabitCompletions.mockResolvedValue([
      { id: 5, habitId: 1, date: getTodayDate() },
    ]);
    service.deleteHabitCompletion.mockResolvedValue(undefined);

    const { result } = setup();
    await waitFor(() => expect(result.current.completedHabitIds.has(1)).toBe(true));

    service.getAllHabitCompletions.mockResolvedValue([]);
    await act(() => result.current.toggleHabit(habit));

    expect(service.deleteHabitCompletion).toHaveBeenCalledWith(1, getTodayDate());
    await waitFor(() => expect(result.current.completedHabitIds.has(1)).toBe(false));
  });
});
