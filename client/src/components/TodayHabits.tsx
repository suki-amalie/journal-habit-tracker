import { Link } from "react-router-dom";

import type { Habit } from "../types/habit";

interface TodayHabitsProps {
  habits: Habit[];
  completedHabitIds: Set<number>;
  maxItems?: number;
}

function TodayHabits({ habits, completedHabitIds, maxItems = 5 }: TodayHabitsProps) {
  const done = habits.filter((habit) => completedHabitIds.has(habit.id)).length;

  return (
    <section className="flex flex-col rounded-2xl border border-[#e6dfd2] bg-[#fffefa] p-5">
      <h2 className="font-serif text-xl text-[#292824]">Habits</h2>
      <p className="mt-0.5 text-sm text-[#8a867c]">
        {habits.length === 0 ? "No habits yet." : `${done} of ${habits.length} today`}
      </p>

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

      <Link to="/habits" className="mt-auto pt-5 text-sm text-[#8a867c] hover:text-[#292824]">
        View habits →
      </Link>
    </section>
  );
}

export default TodayHabits;