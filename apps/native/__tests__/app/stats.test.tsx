import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { processColor } from 'react-native';

import { palette } from '@/theme/tokens';

import StatsPage from '../../app/(tabs)/(afterLogin)/(stats)/index';
import { render, resetAuthMocks } from '../setup/auth-test-utils';
import { createMockRoutine } from '../setup/routine/mock';

let mockAxios: MockAdapter;
let dateNowSpy: jest.SpyInstance<number, []>;

const flattenStyles = (styles: unknown): object[] => {
  if (!styles) return [];
  if (Array.isArray(styles)) {
    return styles.flatMap((style) => flattenStyles(style));
  }

  return [styles as object];
};

describe('StatsPage', () => {
  beforeEach(() => {
    dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-06-15T00:00:00').getTime());
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
    dateNowSpy.mockRestore();
  });

  it('선택한 월의 루틴 통계를 월별 API로 조회한다', async () => {
    mockAxios
      .onGet('/routine/list/monthly', {
        params: { year: 2026, month: 6 },
      })
      .reply(200, {
        data: {
          year: 2026,
          month: 6,
          startDate: '2026-06-01',
          endDate: '2026-06-30',
          activeOnly: false,
          routines: [
            {
              ...createMockRoutine(0),
              category: '운동',
              symbolColor: '#22CC88',
              displayOrder: 1,
              completed: false,
              status: 'ACTIVE',
              achievedDates: ['2026-06-04'],
              monthlyAchievedCount: 1,
            },
          ],
        },
      });

    const { findByLabelText } = render(<StatsPage />);

    expect(await findByLabelText('2026-06-04 수행 완료')).toBeOnTheScreen();
    await waitFor(() => {
      expect(mockAxios.history.get).toHaveLength(1);
    });
    expect(mockAxios.history.get[0]?.params).toEqual({
      year: 2026,
      month: 6,
    });
  });

  it('실제 루틴 목록 응답으로 통계 캘린더를 렌더링한다', async () => {
    mockAxios.onGet('/routine/list/monthly').reply(200, {
      data: {
        year: 2026,
        month: 6,
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        activeOnly: false,
        routines: [
          {
            ...createMockRoutine(0),
            routineName: '운동 주 3회',
            category: '운동',
            displayOrder: 1,
            completed: false,
            status: 'ACTIVE',
            achievedDates: ['2026-06-04', '2026-06-11', '2026-06-19'],
            monthlyAchievedCount: 3,
          },
          {
            ...createMockRoutine(1, { hidden: true }),
            routineName: '악기연습 주 5회',
            category: '취미',
            displayOrder: 2,
            completed: false,
            status: 'ACTIVE',
            achievedDates: ['2026-06-04', '2026-06-22'],
            monthlyAchievedCount: 2,
          },
        ],
      },
    });

    const {
      findAllByLabelText,
      findByText,
      getAllByText,
      getByTestId,
      getByText,
    } = render(<StatsPage />);

    expect(getByText('통계')).toBeOnTheScreen();
    expect(await findByText('운동 주 3회')).toBeOnTheScreen();
    expect(await findByText('악기연습 주 5회')).toBeOnTheScreen();
    expect(getAllByText('6월')).toHaveLength(1);
    const monthHeaderStyles = flattenStyles(
      getByTestId('stats-month-header').props.style,
    );

    expect(monthHeaderStyles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ marginBottom: 12 }),
        expect.objectContaining({ paddingVertical: 10 }),
      ]),
    );
    expect(monthHeaderStyles).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.any(String) }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('stats-routine-list').props.contentContainerStyle,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ paddingHorizontal: 24, paddingTop: 0 }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('stats-routine-list').props.contentContainerStyle,
      ),
    ).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ gap: 28 })]),
    );
    const RoutineCalendarSeparator =
      getByTestId('stats-routine-list').props.ItemSeparatorComponent;
    const { getByTestId: getBySeparatorTestId } = render(
      <RoutineCalendarSeparator />,
    );

    expect(
      flattenStyles(
        getBySeparatorTestId('stats-routine-calendar-separator').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 28 })]),
    );
    expect(palette.theme.gray[45]).toBe('#3F3F46');
    expect(getByTestId('stats-month-chevron-left-icon')).toHaveProp(
      'width',
      16,
    );
    expect(getByTestId('stats-month-chevron-left-icon')).toHaveProp(
      'height',
      10,
    );
    expect(getByText('6월')).toHaveProp('fontWeight', '600');
    expect(flattenStyles(getByText('6월').props.style)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: palette.theme.gray[90] }),
      ]),
    );
    expect(
      getByTestId('stats-month-chevron-left-icon-path').props.stroke,
    ).toEqual(
      expect.objectContaining({
        payload: processColor(palette.theme.gray[45]),
      }),
    );
    const completedJune4Dates =
      await findAllByLabelText('2026-06-04 수행 완료');

    expect(completedJune4Dates).toHaveLength(2);
    expect(completedJune4Dates[0].props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('루틴이 없으면 빈 상태를 렌더링한다', async () => {
    mockAxios.onGet('/routine/list/monthly').reply(200, {
      data: {
        year: 2026,
        month: 6,
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        activeOnly: false,
        routines: [],
      },
    });

    const { findByText } = render(<StatsPage />);

    expect(await findByText('등록된 루틴이 없습니다.')).toBeOnTheScreen();
  });

  it('전환 버튼으로 실제 루틴의 월간 통계 요약 화면을 표시한다', async () => {
    mockAxios.onGet('/routine/list/monthly').reply((config) => {
      const month = Number(config.params?.month);
      const routines =
        month === 6
          ? [
              {
                ...createMockRoutine(0, {
                  startDate: '2026-06-07',
                  routineCount: 2,
                }),
                routineName: '운동 주 2회',
                category: '운동',
                displayOrder: 1,
                completed: false,
                status: 'ACTIVE',
                achievedDates: ['2026-06-07', '2026-06-15'],
                monthlyAchievedCount: 2,
              },
              {
                ...createMockRoutine(1, {
                  startDate: '2026-06-01',
                  endDate: '2026-06-09',
                  routineCount: 3,
                }),
                routineName: '악기연습 주 3회',
                category: '취미',
                displayOrder: 2,
                completed: true,
                status: 'COMPLETED',
                achievedDates: ['2026-06-04'],
                monthlyAchievedCount: 1,
              },
            ]
          : [];

      return [
        200,
        {
          data: {
            year: 2026,
            month,
            startDate: `2026-${String(month).padStart(2, '0')}-01`,
            endDate: month === 6 ? '2026-06-30' : '2026-05-31',
            activeOnly: false,
            routines,
          },
        },
      ];
    });

    const {
      findByText,
      getAllByTestId,
      getByLabelText,
      getByTestId,
      getByText,
      queryByTestId,
      queryByText,
    } = render(<StatsPage />);

    expect(await findByText('운동 주 2회')).toBeOnTheScreen();
    expect(queryByTestId('routine-stats-summary')).toBeNull();

    fireEvent.press(getByLabelText('통계 보기'));

    expect(getByTestId('routine-stats-summary')).toBeOnTheScreen();
    expect(getByTestId('stats-summary-scroll')).toBeOnTheScreen();
    expect(
      getAllByTestId('routine-stats-summary-progress-marker'),
    ).toHaveLength(4);
    expect(getByText('2회 달성')).toBeOnTheScreen();
    expect(getByText('1회 달성')).toBeOnTheScreen();
    expect(queryByText('등록된 루틴이 없습니다.')).toBeNull();
    expect(
      flattenStyles(getByTestId('routine-stats-summary-track-1').props.style),
    ).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderWidth: expect.any(Number) }),
      ]),
    );
    expect(
      getByTestId('routine-stats-summary-track-row-1-0'),
    ).toBeOnTheScreen();
    expect(
      getByTestId('routine-stats-summary-track-row-1-1'),
    ).toBeOnTheScreen();
    expect(
      flattenStyles(
        getByTestId('routine-stats-summary-row-line-1-0').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ position: 'absolute' }),
        expect.objectContaining({
          backgroundColor: palette.theme.softBlue[50],
        }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-summary-turn-connector-1-0').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        }),
        expect.objectContaining({
          borderRightWidth: 1,
        }),
      ]),
    );
    expect(
      flattenStyles(getByTestId('routine-stats-summary-dot-1-6').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: palette.theme.blue[10] }),
        expect.objectContaining({
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: palette.theme.softBlue[50],
        }),
        expect.objectContaining({ opacity: 0.7 }),
      ]),
    );
    expect(
      flattenStyles(getByTestId('routine-stats-summary-dot-1-0').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: palette.theme.softBlue[50],
        }),
        expect.objectContaining({ backgroundColor: palette.theme.blue[50] }),
      ]),
    );
    expect(
      within(getByTestId('routine-stats-summary-dot-1-8')).getByTestId(
        'routine-stats-summary-track-marker-1',
      ),
    ).toBeOnTheScreen();
    expect(
      within(getByTestId('routine-stats-summary-dot-2-4')).getByTestId(
        'routine-stats-summary-track-marker-2',
      ),
    ).toBeOnTheScreen();
    expect(queryByTestId('routine-stats-summary-dot-1-9')).toBeNull();
    expect(
      flattenStyles(getByTestId('routine-stats-summary-item-1').props.style),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ gap: 12 })]));
    expect(
      flattenStyles(getByTestId('routine-stats-summary-track-1').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 0,
        }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-summary-achievement-1').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 36, paddingHorizontal: 12 }),
      ]),
    );
    expect(
      getByTestId('routine-stats-summary-achievement-label-1').props,
    ).toEqual(
      expect.objectContaining({
        fontSize: '$body1',
        fontWeight: '700',
      }),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-summary-achievement-label-1').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: palette.theme.gray[700] }),
        expect.objectContaining({ fontSize: 16 }),
      ]),
    );

    fireEvent.press(getByLabelText('이전 달'));

    expect(getByText('5월')).toBeOnTheScreen();
    expect(queryByTestId('routine-stats-summary-item-1')).toBeNull();

    fireEvent.press(getByLabelText('다음 달'));

    expect(getByText('6월')).toBeOnTheScreen();
    expect(getByTestId('routine-stats-summary-item-1')).toBeOnTheScreen();

    fireEvent.press(getByLabelText('캘린더 보기'));

    expect(queryByTestId('routine-stats-summary')).toBeNull();
  });
});
