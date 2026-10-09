/** Single source of truth for the shortcut cheat sheet (ShortcutsHelp). */
export const SHORTCUTS = [
  { keys: ["B"], description: "Show or hide the sidebar", scope: "Everywhere" },
  { keys: ["D"], description: "Go to Dashboard", scope: "Everywhere" },
  { keys: ["H"], description: "Go to Habits", scope: "Everywhere" },
  { keys: ["J"], description: "Go to Journal", scope: "Everywhere" },
  { keys: ["?"], description: "Show this cheat sheet", scope: "Everywhere" },
  { keys: ["T"], description: "Switch dashboard activity heatmap", scope: "Dashboard" },
  { keys: ["W"], description: "Switch between writing and journal history", scope: "Journal" },
  { keys: ["←", "→"], description: "Turn journal pages", scope: "Journal" },
  { keys: ["C"], description: "Show or hide the activity calendar", scope: "Journal history" },
  { keys: ["E"], description: "Expand or collapse all habit heatmaps", scope: "Habits" },
  { keys: ["Ctrl", "Enter"], description: "Save the entry being edited", scope: "Editor" },
  { keys: ["Esc"], description: "Close a dialog", scope: "Dialogs" },
  { keys: ["N"], description: "Write a new journal", scope: "Journal write page"},
  { keys: ["+"], description: "Add a new habit", scope: "Habit page"},
] as const;