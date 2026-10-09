import { Link } from "react-router-dom";

import type { Habit } from "../types/habit";

interface TodayHabitsProps {
  habits: Habit[];
  completedHabitIds: Set<number>;
  maxItems?: number;
}

function TodayHabits({ habits, completedHabitIds, maxItems = 3 }: TodayHabitsProps) {
  const done = habits.filter((habit) => completedHabitIds.has(habit.id)).length;

  return (
    <section className="flex flex-col rounded-2xl border border-[#e6dfd2] bg-[#fffefa] p-5">
      <h2 className="font-serif text-xl text-[#292824]">Habit
        <span className="text-drop-green">s</span>
      </h2>
      <p className="mt-0.5 text-sm text-[#8a867c]">
        {habits.length === 0 ? "No habits yet." : `${done} of ${habits.length} today`}
      </p>

      {habits.length > 0 && (
        <div
          role="progressbar"
          aria-label="Today's habit completion"
          aria-valuemin={0}
          aria-valuemax={habits.length}
          aria-valuenow={done}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#efe9dc]"
        >
          <div
            className="h-full rounded-full bg-[#778a68] transition-[width]"
            style={{ width: `${(done / habits.length) * 100}%` }}
          />
        </div>
      )}

      {habits.length === 0 && (
        <p className="mt-4 font-handwriting text-xl text-[#8a867c]">A blank page. Begin whenever you're ready.</p>
      )}

      <ul className="mt-4 space-y-2.5">
        {habits.slice(0, maxItems).map((habit) => {
          const completed = completedHabitIds.has(habit.id);

          return (
            <li key={habit.id} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${
                  completed ? "bg-[#4F8A47]" : "border border-[#b9b4a8]"
                }`}
              />
              <span className={completed ? "text-[#8a867c]" : "text-[#292824]"}>
                {habit.name}
              </span>
              <span className="sr-only">{completed ? "(done today)" : "(not done today)"}</span>
            </li>
          );
        })}
      </ul>


      <Link to="/habits" className="mt-auto pt-5 text-sm text-[#5a3e32] hover:text-[#8b5d70]">
        Review today&apos;s habits →
      </Link>
    </section>
  );
}

export default TodayHabits;