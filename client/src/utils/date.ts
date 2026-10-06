// Two day models are used on purpose:
//  - Habit completions are calendar days ("YYYY-MM-DD", the user's local date).
//    The server stores them as UTC midnight and never shifts them.
//  - Journal entries are instants (ISO timestamps). A "day" is a local
//    [from, to) range from getDayRange/getYearRange, and toLocalDateString
//    buckets a timestamp back into a local day.

export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}


export function getTodayDate(): string {
  const timeZone = getUserTimeZone();

  const today = new Date();

  
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
}


export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function getDateString(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function getDaysInYear(year: number): string[] {
  const daysInYear = isLeapYear(year) ? 366 : 365;

  const dates: string[] = [];

  for (let day = 0; day < daysInYear; day++) {
    const date = new Date(year, 0, day + 1);

    dates.push(
      getDateString(
        year,
        date.getMonth() + 1,
        date.getDate(),
      ),
    );
  }

  return dates;
}


export function getWeekday(
  year: number,
  month: number,
  day: number,
): number {
  return new Date(year, month - 1, day).getDay();
}

export function getMondayFirstWeekday(
  year: number,
  month: number,
  day: number,
): number {
  const sundayFirst = getWeekday(year, month, day);

  return (sundayFirst + 6) % 7;
}

export function getMonthWeekPositions(year: number): {
  month: string;
  weekIndex: number;
}[] {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const firstDayOffset = getMondayFirstWeekday(year, 1, 1);

  return months.map((month, index) => {
    const firstDay = new Date(year, index, 1);
    const dayOfYear =
      Math.floor(
        (firstDay.getTime() -
          new Date(year, 0, 1).getTime()) /
          (1000 * 60 * 60 * 24),
      );

    const weekIndex = Math.floor(
      (firstDayOffset + dayOfYear) / 7,
    );

    return {
      month,
      weekIndex,
    };
  });
}

// Timestamp range [from, to) covering one local calendar day.
// Built from calendar fields so DST shifts can't skew the boundaries.
export function getDayRange(date: string): { from: string; to: string } {
  const [year, month, day] = date.split("-").map(Number);

  return {
    from: new Date(year, month - 1, day).toISOString(),
    to: new Date(year, month - 1, day + 1).toISOString(),
  };
}

// Timestamp range [from, to) covering one local calendar year.
export function getYearRange(year: number): { from: string; to: string } {
  return {
    from: new Date(year, 0, 1).toISOString(),
    to: new Date(year + 1, 0, 1).toISOString(),
  };
}

// Converts an instant to the user's local YYYY-MM-DD.
export function toLocalDateString(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: getUserTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}
