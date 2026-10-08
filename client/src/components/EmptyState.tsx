import type { ReactNode } from "react";

import { InkDropGroup } from "./InkDrops";

/** Gentle placeholder shown when a list or page has no content yet. */
interface EmptyStateProps {
  title: string;
  hint?: string;
  action?: ReactNode;
}

function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <InkDropGroup size={26} gap="gap-1.5" className="opacity-80" />
      <p className="mt-3 font-handwriting text-2xl text-[#5A3E32]">{title}</p>
      {hint && <p className="mt-1 text-sm text-[#8a867c]">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;