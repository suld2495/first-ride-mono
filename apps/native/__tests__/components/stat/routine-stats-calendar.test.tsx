import RoutineStatsCalendar from '@/components/stat/routine-stats-calendar';
import { baseFoundation, palette } from '@/theme/tokens';

import { render } from '../../setup/test-utils';

const flattenStyles = (styles: unknown): object[] => {
  if (!styles) return [];
  if (Array.isArray(styles)) {
    return styles.flatMap((style) => flattenStyles(style));
  }

  return [styles as object];
};

describe('RoutineStatsCalendar', () => {
  it('루틴명과 수행 날짜 표시 캘린더를 렌더링한다', () => {
    const { getByLabelText, getByText, queryByText } = render(
      <RoutineStatsCalendar
        routineName="운동 주 3회"
        monthDate={new Date(2026, 5, 1)}
        performedDates={[
          '2026-06-04',
          '2026-06-11',
          '2026-06-19',
          '2026-06-22',
        ]}
      />,
    );

    expect(getByText('운동 주 3회')).toBeOnTheScreen();
    expect(queryByText('6월')).toBeNull();
    expect(getByText('월')).toBeOnTheScreen();
    expect(getByText('일')).toBeOnTheScreen();
    expect(
      getByLabelText('2026-06-04 수행 완료').props.accessibilityState,
    ).toEqual({
      selected: true,
    });
    expect(
      getByLabelText('2026-06-05 미수행').props.accessibilityState,
    ).toEqual({
      selected: false,
    });
  });

  it('수행 완료 날짜의 숫자는 흰색으로 렌더링한다', () => {
    const { getByTestId, getByText } = render(
      <RoutineStatsCalendar
        routineName="운동 주 3회"
        monthDate={new Date(2026, 5, 1)}
        performedDates={['2026-06-04']}
      />,
    );

    expect(flattenStyles(getByText('4').props.style)).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#FFFFFF' })]),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-calendar-day-marker-2026-06-04').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: baseFoundation.dimension.x36,
          height: baseFoundation.dimension.x36,
        }),
        expect.objectContaining({ backgroundColor: palette.theme.blue[50] }),
      ]),
    );
  });

  it('루틴 타이틀은 회색 body1 bold와 상하 여백으로 렌더링한다', () => {
    const { getByTestId, getByText } = render(
      <RoutineStatsCalendar
        routineName="운동 주 3회"
        monthDate={new Date(2026, 5, 1)}
        performedDates={['2026-06-04']}
      />,
    );

    const routineTitle = getByText('운동 주 3회');

    expect(routineTitle).toHaveProp(
      'fontWeight',
      baseFoundation.typography.weight.bold,
    );
    expect(flattenStyles(routineTitle.props.style)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: palette.theme.gray[700] }),
        expect.objectContaining({
          fontSize: baseFoundation.typography.size.body1,
        }),
        expect.objectContaining({ paddingVertical: 7 }),
      ]),
    );
    expect(
      flattenStyles(getByTestId('routine-stats-calendar').props.style),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ gap: 8 })]));
  });

  it('미수행 날짜 숫자는 테마 soft 80 body1 bold로 렌더링한다', () => {
    const { getByText } = render(
      <RoutineStatsCalendar
        routineName="운동 주 3회"
        monthDate={new Date(2026, 5, 1)}
        performedDates={['2026-06-04']}
      />,
    );

    const dayText = getByText('5');

    expect(dayText).toHaveProp(
      'fontWeight',
      baseFoundation.typography.weight.bold,
    );
    expect(flattenStyles(dayText.props.style)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: palette.theme.softBlue[80] }),
        expect.objectContaining({
          fontSize: baseFoundation.typography.size.body1,
        }),
      ]),
    );
  });

  it('요일 라벨과 캘린더 여백을 디자인 값으로 렌더링한다', () => {
    const { getByTestId, getByText } = render(
      <RoutineStatsCalendar
        routineName="운동 주 3회"
        monthDate={new Date(2026, 5, 1)}
        performedDates={['2026-06-04']}
      />,
    );

    const mondayLabel = getByText('월');

    expect(mondayLabel).toHaveProp(
      'fontWeight',
      baseFoundation.typography.weight.medium,
    );
    expect(flattenStyles(mondayLabel.props.style)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: palette.theme.gray[500] }),
        expect.objectContaining({
          fontSize: baseFoundation.typography.size.caption2,
        }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-calendar-week-cell-월').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: baseFoundation.dimension.x36 }),
      ]),
    );
    expect(
      flattenStyles(getByTestId('routine-stats-calendar-body').props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ gap: 20 }),
        expect.objectContaining({ paddingHorizontal: 12 }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-calendar-week-header').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ justifyContent: 'space-between' }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-calendar-week-header').props.style,
      ),
    ).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnGap: expect.any(Number) }),
      ]),
    );
  });

  it('숫자 날짜 행도 요일처럼 양끝 기준 균등 배치한다', () => {
    const { getByTestId } = render(
      <RoutineStatsCalendar
        routineName="운동 주 3회"
        monthDate={new Date(2026, 5, 1)}
        performedDates={['2026-06-04']}
      />,
    );

    expect(
      flattenStyles(getByTestId('routine-stats-calendar-grid').props.style),
    ).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flexWrap: expect.any(String) }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-calendar-week-row-0').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ justifyContent: 'space-between' }),
      ]),
    );
    expect(
      flattenStyles(
        getByTestId('routine-stats-calendar-day-cell-2026-06-01').props.style,
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: baseFoundation.dimension.x36 }),
      ]),
    );
  });

  it('표시 월과 수행 날짜 prop이 바뀌면 날짜 그리드를 갱신한다', () => {
    const { getByLabelText, queryByLabelText, rerender } = render(
      <RoutineStatsCalendar
        routineName="운동 주 3회"
        monthDate={new Date(2026, 4, 1)}
        performedDates={['2026-05-01']}
      />,
    );

    expect(getByLabelText('2026-05-01 수행 완료')).toBeOnTheScreen();

    rerender(
      <RoutineStatsCalendar
        routineName="운동 주 3회"
        monthDate={new Date(2026, 5, 1)}
        performedDates={['2026-06-04']}
      />,
    );

    expect(queryByLabelText('2026-05-01 수행 완료')).toBeNull();
    expect(
      getByLabelText('2026-06-04 수행 완료').props.accessibilityState,
    ).toEqual({
      selected: true,
    });
  });
});
