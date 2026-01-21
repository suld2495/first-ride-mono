import { formatTimeRemaining } from '@repo/shared/utils/date-utils';

describe('formatTimeRemaining', () => {
  describe('미래 날짜 (마감일이 남은 경우)', () => {
    const testCases = [
      {
        description: '3일 남은 경우 D-3 형식으로 표시한다',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-04T12:30:45',
        expected: 'D-3 12:30:45',
      },
      {
        description: '1일 남은 경우 D-1 형식으로 표시한다',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-02T05:15:30',
        expected: 'D-1 05:15:30',
      },
      {
        description: '10일 이상 남은 경우 정확한 일수를 표시한다',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-15T08:20:10',
        expected: 'D-14 08:20:10',
      },
      {
        description: '시간 부분이 00:00:00인 경우도 표시한다',
        startDate: '2024-01-01T12:00:00',
        endDate: '2024-01-03T12:00:00',
        expected: 'D-2 00:00:00',
      },
    ];

    it.each(testCases)('$description', ({ startDate, endDate, expected }) => {
      const result = formatTimeRemaining(new Date(startDate), new Date(endDate));
      expect(result).toBe(expected);
    });
  });

  describe('당일 (마감일 당일)', () => {
    const testCases = [
      {
        description: '마감까지 12시간 남은 경우 시간만 표시한다',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-01T12:00:00',
        expected: '12:00:00',
      },
      {
        description: '마감까지 1시간 남은 경우 시간만 표시한다',
        startDate: '2024-01-01T10:00:00',
        endDate: '2024-01-01T11:30:45',
        expected: '01:30:45',
      },
      {
        description: '마감까지 1분 남은 경우 시간만 표시한다',
        startDate: '2024-01-01T10:00:00',
        endDate: '2024-01-01T10:01:00',
        expected: '00:01:00',
      },
      {
        description: '마감까지 1초 남은 경우 시간만 표시한다',
        startDate: '2024-01-01T10:00:00',
        endDate: '2024-01-01T10:00:01',
        expected: '00:00:01',
      },
    ];

    it.each(testCases)('$description', ({ startDate, endDate, expected }) => {
      const result = formatTimeRemaining(new Date(startDate), new Date(endDate));
      expect(result).toBe(expected);
    });
  });

  describe('과거 날짜 (마감일이 지난 경우)', () => {
    const testCases = [
      {
        description: '1일 지난 경우 D+1 형식으로 표시한다',
        startDate: '2024-01-03T12:30:45',
        endDate: '2024-01-02T00:00:00',
        expected: 'D+1 12:30:45',
      },
      {
        description: '4일 지난 경우 D+4 형식으로 표시한다',
        startDate: '2024-01-05T00:00:00',
        endDate: '2024-01-01T00:00:00',
        expected: 'D+4 00:00:00',
      },
      {
        description: '10일 이상 지난 경우 정확한 일수를 표시한다',
        startDate: '2024-01-20T14:25:35',
        endDate: '2024-01-01T10:15:20',
        expected: 'D+19 04:10:15',
      },
      {
        description: '당일에 마감을 지난 경우 - 접두사와 함께 시간을 표시한다',
        startDate: '2024-01-01T12:00:00',
        endDate: '2024-01-01T10:30:15',
        expected: '-01:29:45',
      },
      {
        description: '당일에 1시간 지난 경우',
        startDate: '2024-01-01T11:00:00',
        endDate: '2024-01-01T10:00:00',
        expected: '-01:00:00',
      },
      {
        description: '당일에 수 분 지난 경우',
        startDate: '2024-01-01T10:05:30',
        endDate: '2024-01-01T10:00:00',
        expected: '-00:05:30',
      },
    ];

    it.each(testCases)('$description', ({ startDate, endDate, expected }) => {
      const result = formatTimeRemaining(new Date(startDate), new Date(endDate));
      expect(result).toBe(expected);
    });
  });

  describe('경계값 테스트', () => {
    const testCases = [
      {
        description: '정확히 24시간 남은 경우 D-1로 표시한다',
        startDate: '2024-01-01T10:00:00',
        endDate: '2024-01-02T10:00:00',
        expected: 'D-1 00:00:00',
      },
      {
        description: '정확히 24시간이 지난 경우 D+1로 표시한다',
        startDate: '2024-01-02T10:00:00',
        endDate: '2024-01-01T10:00:00',
        expected: 'D+1 00:00:00',
      },
      {
        description: '시작일과 종료일이 동일한 경우 00:00:00을 표시한다',
        startDate: '2024-01-01T10:00:00',
        endDate: '2024-01-01T10:00:00',
        expected: '00:00:00',
      },
      {
        description: '23시간 59분 59초 남은 경우 시간만 표시한다',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-01T23:59:59',
        expected: '23:59:59',
      },
      {
        description: '24시간 1초 남은 경우 D-1로 표시한다',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-02T00:00:01',
        expected: 'D-1 00:00:01',
      },
    ];

    it.each(testCases)('$description', ({ startDate, endDate, expected }) => {
      const result = formatTimeRemaining(new Date(startDate), new Date(endDate));
      expect(result).toBe(expected);
    });
  });

  describe('시간 포맷팅 검증', () => {
    const testCases = [
      {
        description: '한 자리 숫자는 0으로 패딩된다',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-02T01:02:03',
        expected: 'D-1 01:02:03',
      },
      {
        description: '두 자리 숫자는 그대로 표시된다',
        startDate: '2024-01-01T00:00:00',
        endDate: '2024-01-02T23:59:59',
        expected: 'D-1 23:59:59',
      },
      {
        description: '과거 날짜의 시간도 올바르게 패딩된다',
        startDate: '2024-01-03T05:07:09',
        endDate: '2024-01-01T02:03:04',
        expected: 'D+2 03:04:05',
      },
    ];

    it.each(testCases)('$description', ({ startDate, endDate, expected }) => {
      const result = formatTimeRemaining(new Date(startDate), new Date(endDate));
      expect(result).toBe(expected);
    });
  });
});
