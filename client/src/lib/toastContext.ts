import { createContext } from "react";

export interface ToastOptions {
  message: string;
  // Called when the user presses Undo. Without it the toast has no action.
  onUndo?: () => void;
  // Called when the toast ends without an undo (timeout or dismissal).
  onCommit?: () => void;
  durationMs?: number;
}

export interface ToastApi {
  show: (options: ToastOptions) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
