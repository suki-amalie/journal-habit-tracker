// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useToast } from "../hooks/useToast";
import ToastProvider from "./ToastProvider";

function Trigger({ onUndo, onCommit }: { onUndo: () => void; onCommit: () => void }) {
  const toast = useToast();

  return (
    <button onClick={() => toast.show({ message: "Deleted", onUndo, onCommit })}>
      show
    </button>
  );
}

function setup() {
  const onUndo = vi.fn();
  const onCommit = vi.fn();

  render(
    <ToastProvider>
      <Trigger onUndo={onUndo} onCommit={onCommit} />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText("show"));

  return { onUndo, onCommit };
}

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ToastProvider undo window", () => {
  it("commits when the timer runs out", () => {
    const { onUndo, onCommit } = setup();

    expect(screen.getByText("Deleted")).toBeTruthy();
    expect(onCommit).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(6000));

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onUndo).not.toHaveBeenCalled();
    expect(screen.queryByText("Deleted")).toBeNull();
  });

  it("undoes without committing", () => {
    const { onUndo, onCommit } = setup();

    fireEvent.click(screen.getByText("Undo"));
    act(() => vi.advanceTimersByTime(10_000));

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("commits pending deletes if the app unmounts", () => {
    const { onCommit } = setup();

    cleanup();

    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
