/**
 * 날짜 범위를 포맷팅합니다.
 * 같은 월이면 "MM/DD-DD", 다른 월이면 "MM/DD-MM/DD" 형식으로 반환합니다.
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth}/${startDay}-${endDay}`;
  }
  return `${startMonth}/${startDay}-${endMonth}/${endDay}`;
};

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가합니다.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * 퀘스트 타입에 따른 배지 클래스를 반환합니다.
 */
export const getQuestTypeBadgeClass = (type: string): string => {
  switch (type) {
    case 'DAILY':
      return 'bg-blue-500 text-white'; // 파란색
    case 'WEEKLY':
      return 'bg-green-500 text-white'; // 초록색
    default:
      return 'bg-gray-500 text-white';
  }
};

/**
 * ISO 날짜를 input datetime-local 형식으로 변환합니다.
 */
export const toDateTimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * input datetime-local을 ISO 형식으로 변환합니다.
 */
export const fromDateTimeLocal = (dateTimeLocal: string): string => {
  return new Date(dateTimeLocal).toISOString();
};
