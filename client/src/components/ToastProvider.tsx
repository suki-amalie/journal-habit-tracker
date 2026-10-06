import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ToastContext, type ToastOptions } from "../lib/toastContext";

interface ActiveToast extends ToastOptions {
  id: number;
}

const DEFAULT_DURATION_MS = 6000;

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const live = useRef(new Map<number, ActiveToast>());

  const finish = useCallback((id: number, undo: boolean) => {
    const toast = live.current.get(id);
    if (!toast) return;

    live.current.delete(id);
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((t) => t.id !== id));

    if (undo) toast.onUndo?.();
    else toast.onCommit?.();
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      const toast = { ...options, id };

      live.current.set(id, toast);
      setToasts((current) => [...current, toast]);
      timers.current.set(
        id,
        setTimeout(() => finish(id, false), options.durationMs ?? DEFAULT_DURATION_MS),
      );
    },
    [finish],
  );

  // Pending deletes must still happen if the whole app unmounts.
  useEffect(() => {
    const pending = live.current;
    const pendingTimers = timers.current;

    return () => {
      pendingTimers.forEach(clearTimeout);
      pendingTimers.clear();
      pending.forEach((toast) => toast.onCommit?.());
      pending.clear();
    };
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-4 rounded-md bg-[#292824] px-4 py-3 text-sm text-white shadow-lg"
          >
            <span>{toast.message}</span>

            {toast.onUndo && (
              <button
                type="button"
                onClick={() => finish(toast.id, true)}
                className="font-medium text-[#9ed596] hover:underline"
              >
                Undo
              </button>
            )}

            <button
              type="button"
              onClick={() => finish(toast.id, false)}
              aria-label="Dismiss"
              className="text-white/60 hover:text-white"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
