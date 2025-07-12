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

export const getDaysOfTheWeek = () => [
  '월',
  '화',
  '수',
  '목',
  '금',
  '토',
  '일',
];
