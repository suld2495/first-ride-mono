const PAD_LENGTH = 2;
const DAYS_PER_WEEK = 7;
const MONDAY_INDEX = 1;
const SUNDAY_INDEX = 0;
const MONDAY_OFFSET_FROM_SUNDAY = -6;
const SHORT_YEAR_START_INDEX = -2;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const SECONDS_PER_DAY = HOURS_PER_DAY * SECONDS_PER_HOUR;

export const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(PAD_LENGTH, '0');
  const day = String(today.getDate()).padStart(PAD_LENGTH, '0');

  return `${year}-${month}-${day}`;
};

export const getFormatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(PAD_LENGTH, '0');
  const day = String(date.getDate()).padStart(PAD_LENGTH, '0');

  return `${year}-${month}-${day}`;
};

export const getFormatDateTime = (dateInput: Date | string) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(PAD_LENGTH, '0');
  const day = String(date.getDate()).padStart(PAD_LENGTH, '0');
  const hour = String(date.getHours()).padStart(PAD_LENGTH, '0');
  const minute = String(date.getMinutes()).padStart(PAD_LENGTH, '0');
  const second = String(date.getSeconds()).padStart(PAD_LENGTH, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const getDisplayFormatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(SHORT_YEAR_START_INDEX);
  const month = String(date.getMonth() + 1).padStart(PAD_LENGTH, '0');
  const day = String(date.getDate()).padStart(PAD_LENGTH, '0');

  return `${year}년 ${month}월 ${day}일`;
};

export const getWeekMonday = (date: Date) => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff =
    newDate.getDate() -
    day +
    (day === SUNDAY_INDEX ? MONDAY_OFFSET_FROM_SUNDAY : MONDAY_INDEX);

  return getFormatDate(new Date(newDate.setDate(diff)));
};

export const getWeekSunday = (date: Date) => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff =
    newDate.getDate() - day + (day === SUNDAY_INDEX ? 0 : DAYS_PER_WEEK);

  return getFormatDate(new Date(newDate.setDate(diff)));
};

export const beforeWeek = (date: Date) => {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() - DAYS_PER_WEEK);
  return getFormatDate(newDate);
};

export const afterWeek = (date: Date) => {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() + DAYS_PER_WEEK);
  return getFormatDate(newDate);
};

export const getSecondsBetween = (startDate: Date, endDate: Date) => {
  return (endDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_SECOND;
};

export const formatTimeRemaining = (startDate: Date, endDate: Date) => {
  const seconds = getSecondsBetween(startDate, endDate);

  const isPast = seconds < 0;
  const absSeconds = Math.abs(seconds);

  // 각 단위로 변환
  const days = Math.floor(absSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((absSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (absSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const secs = Math.floor(absSeconds % SECONDS_PER_MINUTE);

  // 시:분:초 포맷 (2자리로 패딩)
  const timeString = [
    hours.toString().padStart(PAD_LENGTH, '0'),
    minutes.toString().padStart(PAD_LENGTH, '0'),
    secs.toString().padStart(PAD_LENGTH, '0'),
  ].join(':');

  // 마감 이후(과거): D+N, 마감 이전(미래): D-N, 당일: D-0
  const prefix = isPast ? 'D+' : 'D-';
  return `${prefix}${days} ${timeString}`;
};

export const getDaysOfTheWeek = () => [
  '월',
  '화',
  '수',
  '목',
  '금',
  '토',
  '일',
];

export const getThisWeekMonday = (): Date => {
  return new Date(getWeekMonday(new Date()));
};

export const isMonday = (date: Date) => {
  return date.getDay() === MONDAY_INDEX;
};

export const getMondayDate = (date: Date) => {
  return new Date(getWeekMonday(date));
};

export const getNextMonday = (date: Date) => {
  const monday = getMondayDate(date);

  if (monday >= date) {
    return monday;
  }

  const nextMonday = new Date(monday);

  nextMonday.setDate(nextMonday.getDate() + DAYS_PER_WEEK);
  return nextMonday;
};
