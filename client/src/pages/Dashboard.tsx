import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  PenLine,
  Circle,
} from "lucide-react";

const habits = [
  { name: "LeetCode", streak: 12 },
  { name: "Read", streak: 5 },
  { name: "Japanese", streak: 8 },
  { name: "Exercise", streak: 3 },
];

const journalEntries = [
  {
    date: "Sep 25",
    title: "A productive day",
    preview: "Finally got through the two pointers problem...",
  },
  {
    date: "Sep 24",
    title: "Learning something new",
    preview: "Spent some time working on the journal app...",
  },
  {
    date: "Sep 23",
    title: "Small progress",
    preview: "Didn't get everything done today, but that's okay.",
  },
];

// Generate deterministic heatmap data.
// 0 = no activity, 1-4 = increasing activity.
const heatmap = Array.from({ length: 365 }, (_, i) => {
  const pattern = [0, 1, 0, 2, 1, 0, 3, 1, 0, 2, 4, 1, 0];
  return pattern[i % pattern.length];
});

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#24292f]">
      {/* Header */}
      <header className="border-b border-[#d0d7de] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#24292f] text-white">
              <BookOpen size={19} />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              Daily
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <a href="/" className="font-medium text-[#24292f]">
              Dashboard
            </a>
            <a
              href="/journal"
              className="text-[#57606a] transition hover:text-[#24292f]"
            >
              Journal
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Greeting */}
        <section className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-[#57606a]">
              Saturday, September 26, 2026
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Good evening 👋
            </h1>

            <p className="mt-2 text-[#57606a]">
              Take a moment to reflect on your day.
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-lg bg-[#24292f] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#424a53]">
            <PenLine size={16} />
            Write today
          </button>
        </section>

        {/* Habit heatmap */}
        <section className="rounded-xl border border-[#d0d7de] bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Habit activity</h2>
              <p className="mt-1 text-sm text-[#57606a]">
                Your consistency over the past year
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button className="rounded-md p-1.5 text-[#57606a] hover:bg-[#f6f8fa]">
                <ChevronLeft size={18} />
              </button>

              <span className="px-2 text-sm font-medium">2026</span>

              <button className="rounded-md p-1.5 text-[#57606a] hover:bg-[#f6f8fa]">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Heatmap */}
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              <div className="mb-2 ml-8 flex justify-between text-xs text-[#57606a]">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>

              <div className="flex gap-1">
                {/* Weekday labels */}
                <div className="flex w-7 flex-col justify-between py-0.5 text-[10px] text-[#57606a]">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Columns */}
                <div className="flex gap-1">
                  {Array.from({ length: 53 }, (_, week) => (
                    <div key={week} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }, (_, day) => {
                        const value = heatmap[week * 7 + day] ?? 0;

                        const intensity = [
                          "bg-[#ebedf0]",
                          "bg-[#9be9a8]",
                          "bg-[#40c463]",
                          "bg-[#30a14e]",
                          "bg-[#216e39]",
                        ][value];

                        return (
                          <div
                            key={day}
                            title={`${value} habit completions`}
                            className={`h-3 w-3 rounded-[2px] ${intensity}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 text-xs text-[#57606a]">
                <span>Less</span>
                <span className="h-3 w-3 rounded-[2px] bg-[#ebedf0]" />
                <span className="h-3 w-3 rounded-[2px] bg-[#9be9a8]" />
                <span className="h-3 w-3 rounded-[2px] bg-[#40c463]" />
                <span className="h-3 w-3 rounded-[2px] bg-[#30a14e]" />
                <span className="h-3 w-3 rounded-[2px] bg-[#216e39]" />
                <span>More</span>
              </div>
            </div>
          </div>
        </section>

        {/* Today's habits + stats */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Today's habits */}
          <div className="lg:col-span-2 rounded-xl border border-[#d0d7de] bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Today's habits</h2>
                <p className="mt-1 text-sm text-[#57606a]">
                  Saturday, September 26
                </p>
              </div>

              <button className="flex items-center gap-1.5 rounded-md border border-[#d0d7de] px-3 py-1.5 text-sm font-medium hover:bg-[#f6f8fa]">
                <Plus size={15} />
                Add habit
              </button>
            </div>

            <div className="divide-y divide-[#d8dee4]">
              {habits.map((habit, index) => {
                const completed = index !== 2;

                return (
                  <div
                    key={habit.name}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                          completed
                            ? "border-[#216e39] bg-[#216e39] text-white"
                            : "border-[#8c959f] text-transparent hover:border-[#57606a]"
                        }`}
                      >
                        {completed ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <Circle size={14} />
                        )}
                      </button>

                      <span
                        className={`text-sm font-medium ${
                          completed ? "text-[#57606a] line-through" : ""
                        }`}
                      >
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-[#57606a]">
                      <Flame size={15} />
                      {habit.streak} day streak
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-[#d0d7de] bg-white p-6">
            <h2 className="text-lg font-semibold">Your progress</h2>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm text-[#57606a]">Current streak</p>
                <p className="mt-1 text-3xl font-semibold">12 days</p>
              </div>

              <div>
                <p className="text-sm text-[#57606a]">Best streak</p>
                <p className="mt-1 text-3xl font-semibold">24 days</p>
              </div>

              <div>
                <p className="text-sm text-[#57606a]">This year</p>
                <p className="mt-1 text-3xl font-semibold">183</p>
                <p className="mt-1 text-sm text-[#57606a]">
                  habit completions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Journal */}
        <section className="mt-6 rounded-xl border border-[#d0d7de] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent journal entries</h2>
              <p className="mt-1 text-sm text-[#57606a]">
                Your latest reflections
              </p>
            </div>

            <a
              href="/journal"
              className="text-sm font-medium text-[#0969da] hover:underline"
            >
              View all
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {journalEntries.map((entry) => (
              <article
                key={entry.date}
                className="rounded-lg border border-[#d8dee4] p-4 transition hover:border-[#8c959f] hover:shadow-sm"
              >
                <p className="text-xs font-medium text-[#57606a]">
                  {entry.date}
                </p>

                <h3 className="mt-2 font-semibold">{entry.title}</h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#57606a]">
                  {entry.preview}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;