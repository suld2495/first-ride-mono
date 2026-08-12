const MILLISECONDS_PER_SECOND = 1000;

export const getLocalDateKey = (date: Date): string =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value) => String(value).padStart(2, '0'))
    .join('-');

export const getNextMidnight = (now: Date): Date => {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight;
};

export const getMillisecondsUntilNextMidnight = (now: Date): number =>
  Math.max(1, getNextMidnight(now).getTime() - now.getTime());

export const getSecondsUntilNextMidnight = (now: Date): number =>
  Math.max(
    1,
    Math.ceil(getMillisecondsUntilNextMidnight(now) / MILLISECONDS_PER_SECOND),
  );

export const formatCountdown = (totalSeconds: number): string => {
  const safeTotalSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeTotalSeconds / 3600);
  const minutes = Math.floor((safeTotalSeconds % 3600) / 60);
  const seconds = safeTotalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
};
