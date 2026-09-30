// TodayProgress.tsx

interface TodayProgressProps {
  done: number;
  total: number;
}

function getMessage(done: number, total: number): string {
  if (total === 0) return "Start with something small.";

  const percent = done / total;

  if (percent === 1) return "You did wonderfully today.";
  if (percent >= 0.75) return "You're doing wonderfully. Almost there.";
  if (percent >= 0.5) return "You're doing well. Keep going at your own pace.";
  if (percent > 0) return "You showed up today, good job!";
  return "You can start small.";
}

function TodayProgress({
  done,
  total,
}: TodayProgressProps) {
  const percent =
    total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="order-first rounded-lg border border-[#ddd9d0] bg-[#fffefa] p-6 sm:p-7 lg:order-none">
      <h2 className="text-lg font-semibold text-[#292824]">
        Today's progress
      </h2>

      <p className="mt-2 text-sm text-[#716f68]">
        {getMessage(done, total)}
      </p>

      <p className="mt-8 text-4xl font-semibold tracking-tight text-[#292824]">
        {done}
        <span className="text-xl font-normal text-[#aaa69d]">
          {" "}
          / {total}
        </span>
      </p>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Habits completed today"
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#eae7df]"
      >
        <div
          className="h-full rounded-full bg-[#4f8a47] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}

export default TodayProgress;