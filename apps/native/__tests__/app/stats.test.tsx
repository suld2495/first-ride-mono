import axiosInstance from '@repo/shared/api';
import { fireEvent } from '@testing-library/react-native';
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

  it('실제 루틴 목록 응답으로 통계 캘린더를 렌더링한다', async () => {
    mockAxios.onGet('/routine/list/all').reply(200, {
      data: [
        {
          ...createMockRoutine(0, {
            successDate: ['260604', '260611', '260619'],
          }),
          routineName: '운동 주 3회',
        },
        {
          ...createMockRoutine(1, {
            successDate: ['260604', '260622'],
          }),
          routineName: '악기연습 주 5회',
        },
      ],
    });
    mockAxios.onGet('/routine/list').reply(200, { data: [] });

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
    mockAxios.onGet('/routine/list/all').reply(200, { data: [] });
    mockAxios.onGet('/routine/list').reply(200, { data: [] });

    const { findByText } = render(<StatsPage />);

    expect(await findByText('등록된 루틴이 없습니다.')).toBeOnTheScreen();
  });

  it('전환 버튼으로 임시 통계 요약 화면을 표시한다', async () => {
    mockAxios.onGet('/routine/list/all').reply(200, {
      data: [
        {
          ...createMockRoutine(0, {
            successDate: ['260604', '260611', '260619'],
          }),
          routineName: '운동 주 3회',
        },
      ],
    });
    mockAxios.onGet('/routine/list').reply(200, { data: [] });

    const {
      findByText,
      getAllByTestId,
      getByLabelText,
      getByTestId,
      getByText,
      queryByTestId,
      queryByText,
    } = render(<StatsPage />);

    expect(await findByText('운동 주 3회')).toBeOnTheScreen();
    expect(queryByTestId('routine-stats-summary')).toBeNull();

    fireEvent.press(getByLabelText('통계 보기'));

    expect(getByTestId('routine-stats-summary')).toBeOnTheScreen();
    expect(getByTestId('stats-summary-scroll')).toBeOnTheScreen();
    expect(
      getAllByTestId('routine-stats-summary-progress-marker'),
    ).toHaveLength(4);
    expect(getByText('3회 달성')).toBeOnTheScreen();
    expect(getByText('5회 달성')).toBeOnTheScreen();
    expect(queryByText('등록된 루틴이 없습니다.')).toBeNull();
    expect(
      flattenStyles(
        getByTestId('routine-stats-summary-track-exercise').props.style,
      ),
    ).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderWidth: expect.any(Number) }),
      ]),
    );
    expect(
      getByTestId('routine-stats-summary-track-row-exercise-0'),
    ).toBeOnTheScreen();
    expect(
      getByTestId('routine-stats-summary-track-row-exercise-1'),
    ).toBeOnTheScreen();
    expect(
      flattenStyles(
        getByTestId('routine-stats-summary-row-line-exercise-0').props.style,
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
        getByTestId('routine-stats-summary-turn-connector-exercise-0').props
          .style,
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
      flattenStyles(
        getByTestId('routine-stats-summary-dot-exercise-6').props.style,
      ),
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
      flattenStyles(
        getByTestId('routine-stats-summary-dot-exercise-0').props.style,
      ),
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

    fireEvent.press(getByLabelText('캘린더 보기'));

    expect(queryByTestId('routine-stats-summary')).toBeNull();
  });
});
