import {
  calculateMonthlyRoutineStats,
  normalizeRoutineDateKey,
} from '@/utils/routine-stats';

describe('routine stats utils', () => {
  describe('normalizeRoutineDateKey', () => {
    it.each([
      ['260604', '2026-06-04'],
      ['20260604', '2026-06-04'],
      ['2026-06-04', '2026-06-04'],
      ['2026-06-04T00:00:00Z', '2026-06-04'],
    ])('%s를 날짜 키 %s로 정규화한다', (value, expected) => {
      expect(normalizeRoutineDateKey(value)).toBe(expected);
    });
  });

  describe('calculateMonthlyRoutineStats', () => {
    it('선택 월의 각 주별 목표 횟수를 합산한다', () => {
      expect(
        calculateMonthlyRoutineStats({
          monthDate: new Date(2026, 5, 1),
          startDate: '2026-06-01',
          routineCount: 2,
          successDates: [],
        }),
      ).toEqual({ totalAvailableCount: 10, achievedCount: 0 });
    });

    it('일요일에 시작한 첫 주는 달성 가능한 1회만 계산한다', () => {
      expect(
        calculateMonthlyRoutineStats({
          monthDate: new Date(2026, 5, 1),
          startDate: '2026-06-07',
          routineCount: 2,
          successDates: [],
        }),
      ).toEqual({ totalAvailableCount: 9, achievedCount: 0 });
    });

    it('종료일이 포함된 마지막 주도 활성 일수로 제한한다', () => {
      expect(
        calculateMonthlyRoutineStats({
          monthDate: new Date(2026, 5, 1),
          startDate: '2026-06-01',
          endDate: '2026-06-09',
          routineCount: 3,
          successDates: [],
        }),
      ).toEqual({ totalAvailableCount: 5, achievedCount: 0 });
    });

    it('선택 월과 활성 기간이 겹치지 않으면 0회로 계산한다', () => {
      expect(
        calculateMonthlyRoutineStats({
          monthDate: new Date(2026, 5, 1),
          startDate: '2026-07-01',
          routineCount: 3,
          successDates: [],
        }),
      ).toEqual({ totalAvailableCount: 0, achievedCount: 0 });
    });

    it('선택 월의 성공 날짜만 중복 없이 달성 횟수로 계산한다', () => {
      expect(
        calculateMonthlyRoutineStats({
          monthDate: new Date(2026, 5, 1),
          startDate: '2026-06-07',
          endDate: '2026-06-30',
          routineCount: 2,
          successDates: [
            '260606',
            '260607',
            '20260607',
            '2026-06-15',
            '2026-07-01',
          ],
        }),
      ).toEqual({ totalAvailableCount: 9, achievedCount: 2 });
    });
  });
});
