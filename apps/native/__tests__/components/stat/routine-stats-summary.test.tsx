import type { RoutineMonthlySummary } from '@repo/types';

import RoutineStatsSummary from '@/components/stat/routine-stats-summary';

import { render } from '../../setup/test-utils';

const ROUTINE_COLOR = '#00C9BD';

const createRoutine = (achievedCount: number): RoutineMonthlySummary => ({
  routineId: 1,
  routineName: '운동',
  routineDetail: '매일 운동하기',
  category: '운동',
  symbolColor: ROUTINE_COLOR,
  penalty: 0,
  routineCount: 7,
  mateNickname: null,
  startDate: '2026-07-01',
  endDate: '2026-07-31',
  displayOrder: 1,
  paused: false,
  hidden: false,
  completed: false,
  status: 'ACTIVE',
  achievedDates: Array.from(
    { length: achievedCount },
    (_, index) => `2026-07-${String(index + 1).padStart(2, '0')}`,
  ),
  monthlyAchievedCount: achievedCount,
});

const flattenStyles = (styles: unknown): object[] => {
  if (!styles) return [];
  if (Array.isArray(styles)) {
    return styles.flatMap((style) => flattenStyles(style));
  }

  return [styles as object];
};

const expectDotToBeFilled = (
  getByTestId: ReturnType<typeof render>['getByTestId'],
  index: number,
) => {
  expect(
    flattenStyles(
      getByTestId(`routine-stats-summary-dot-1-${index}`).props.style,
    ),
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ backgroundColor: ROUTINE_COLOR }),
    ]),
  );
};

const expectDotToBeEmpty = (
  getByTestId: ReturnType<typeof render>['getByTestId'],
  index: number,
) => {
  expect(
    flattenStyles(
      getByTestId(`routine-stats-summary-dot-1-${index}`).props.style,
    ),
  ).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ backgroundColor: ROUTINE_COLOR }),
    ]),
  );
};

describe('RoutineStatsSummary', () => {
  it('홀수 번째 줄은 왼쪽부터 채운다', () => {
    const { getByTestId } = render(
      <RoutineStatsSummary
        monthDate={new Date(2026, 6, 1)}
        routines={[createRoutine(2)]}
      />,
    );

    expectDotToBeFilled(getByTestId, 0);
    expectDotToBeFilled(getByTestId, 1);
    expectDotToBeEmpty(getByTestId, 2);
  });

  it('짝수 번째 줄은 오른쪽부터 채운다', () => {
    const { getByTestId } = render(
      <RoutineStatsSummary
        monthDate={new Date(2026, 6, 1)}
        routines={[createRoutine(8)]}
      />,
    );

    expectDotToBeFilled(getByTestId, 13);
    expectDotToBeEmpty(getByTestId, 12);
    expectDotToBeEmpty(getByTestId, 7);
  });
});
