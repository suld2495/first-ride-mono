const DAYS_PER_WEEK = 7;
const SHORT_DATE_LENGTH = 6;
const COMPACT_DATE_LENGTH = 8;
const DATE_KEY_LENGTH = 10;
const SHORT_YEAR_PREFIX = '20';

export interface MonthlyRoutineStatsInput {
  monthDate: Date;
  startDate: string;
  endDate?: string;
  routineCount: number;
  successDates: readonly string[];
}

export interface MonthlyRoutineStats {
  totalAvailableCount: number;
  achievedCount: number;
}

export const normalizeRoutineDateKey = (value: string): string => {
  if (value.includes('-')) {
    return value.slice(0, DATE_KEY_LENGTH);
  }

  if (value.length === SHORT_DATE_LENGTH) {
    return `${SHORT_YEAR_PREFIX}${value.slice(0, 2)}-${value.slice(
      2,
      4,
    )}-${value.slice(4, 6)}`;
  }

  if (value.length === COMPACT_DATE_LENGTH) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }

  return value;
};

const parseDateOnly = (value: string): Date | null => {
  const normalized = normalizeRoutineDateKey(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, monthIndex, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

const getCalendarDayNumber = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
  (24 * 60 * 60 * 1000);

const getInclusiveDayCount = (start: Date, end: Date): number =>
  getCalendarDayNumber(end) - getCalendarDayNumber(start) + 1;

const getLaterDate = (first: Date, second: Date): Date =>
  first > second ? first : second;

const getEarlierDate = (first: Date, second: Date): Date =>
  first < second ? first : second;

const isWithinRange = (date: Date, start: Date, end: Date): boolean =>
  date >= start && date <= end;

export const calculateMonthlyRoutineStats = ({
  monthDate,
  startDate,
  endDate,
  routineCount,
  successDates,
}: MonthlyRoutineStatsInput): MonthlyRoutineStats => {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  );
  const parsedStartDate = parseDateOnly(startDate);
  const parsedEndDate = endDate ? parseDateOnly(endDate) : monthEnd;
  const weeklyTarget = Math.max(0, Math.floor(routineCount));

  if (!parsedStartDate || !parsedEndDate || weeklyTarget === 0) {
    return { totalAvailableCount: 0, achievedCount: 0 };
  }

  const activeStart = getLaterDate(monthStart, parsedStartDate);
  const activeEnd = getEarlierDate(monthEnd, parsedEndDate);

  if (activeStart > activeEnd) {
    return { totalAvailableCount: 0, achievedCount: 0 };
  }

  let totalAvailableCount = 0;
  let weekStart = activeStart;

  while (weekStart <= activeEnd) {
    const mondayBasedWeekday = (weekStart.getDay() + 6) % DAYS_PER_WEEK;
    const weekEnd = addDays(weekStart, DAYS_PER_WEEK - mondayBasedWeekday - 1);
    const activeWeekEnd = getEarlierDate(weekEnd, activeEnd);
    const activeDayCount = getInclusiveDayCount(weekStart, activeWeekEnd);

    totalAvailableCount += Math.min(weeklyTarget, activeDayCount);
    weekStart = addDays(activeWeekEnd, 1);
  }

  const achievedDateKeys = new Set(
    successDates
      .map(normalizeRoutineDateKey)
      .map(parseDateOnly)
      .filter((date): date is Date => Boolean(date))
      .filter((date) => isWithinRange(date, activeStart, activeEnd))
      .map((date) => getCalendarDayNumber(date)),
  );

  return {
    totalAvailableCount,
    achievedCount: achievedDateKeys.size,
  };
};
