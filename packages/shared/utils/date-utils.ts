export const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getFormatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getDisplayFormatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}년 ${month}월 ${day}일`;
};

export const getWeekMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  return getFormatDate(new Date(date.setDate(diff)));
};

export const getWeekSunday = (date: Date) => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? 0 : 7);

  return getFormatDate(new Date(newDate.setDate(diff)));
};

export const beforeWeek = (date: Date) => {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() - 7);
  return getFormatDate(newDate);
};

export const afterWeek = (date: Date) => {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() + 7);
  return getFormatDate(newDate);
};

export const getSecondsBetween = (startDate: Date, endDate: Date) => {
  return (endDate.getTime() - startDate.getTime()) / 1000;
};

export const formatTimeRemaining = (startDate: Date, endDate: Date) => {
  const seconds = getSecondsBetween(startDate, endDate);

  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);

  // 각 단위로 변환
  const days = Math.floor(absSeconds / (24 * 60 * 60));
  const hours = Math.floor((absSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((absSeconds % (60 * 60)) / 60);
  const secs = Math.floor(absSeconds % 60);

  // 시:분:초 포맷 (2자리로 패딩)
  const timeString = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');

  // 일수가 있으면 포함
  const result = days > 0 ? `D-${days} ${timeString}` : timeString;

  return isNegative ? `-${result}` : result;
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
