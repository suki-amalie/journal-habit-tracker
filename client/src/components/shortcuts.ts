/** Single source of truth for the shortcut cheat sheet (ShortcutsHelp). */
export const SHORTCUTS = [
  { keys: ["B"], description: "Show or hide the sidebar", scope: "Everywhere" },
  { keys: ["?"], description: "Show this cheat sheet", scope: "Everywhere" },
  { keys: ["←", "→"], description: "Turn journal pages", scope: "Journal" },
  { keys: ["C"], description: "Show or hide the activity calendar", scope: "Journal history" },
  { keys: ["E"], description: "Expand or collapse all habit heatmaps", scope: "Habits" },
  { keys: ["Ctrl", "Enter"], description: "Save the entry being edited", scope: "Editor" },
  { keys: ["Esc"], description: "Close a dialog", scope: "Dialogs" },
] as const;