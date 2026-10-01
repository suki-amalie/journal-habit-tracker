// utils/date.ts

export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}


export function getTodayDate(): string {
  const timeZone = getUserTimeZone();
  
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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