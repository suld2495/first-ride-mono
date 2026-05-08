import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import RoutineReorderModal from '../../../components/modal/routine-reorder-modal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockRoutines } from '../../setup/routine/mock';

declare const mockBack: jest.Mock;
declare const mockShowToast: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;

let mockAxios: MockAdapter;
let latestDragEnd: ((params: { data: unknown[] }) => void) | undefined;

jest.mock('react-native-draggable-flatlist', () => {
  const React = require('react');
  const { FlatList } = require('react-native');
  const MockDraggableFlatList = React.forwardRef(
    (props: Record<string, any>, ref: unknown) => {
      latestDragEnd = props.onDragEnd;

      return React.createElement(FlatList, {
        ref,
        ...props,
        renderItem: (params: Record<string, unknown>) =>
          props.renderItem({
            ...params,
            drag: jest.fn(),
            isActive: false,
          }),
      });
    },
  );

  MockDraggableFlatList.displayName = 'MockDraggableFlatList';

  return { __esModule: true, default: MockDraggableFlatList };
});

describe('RoutineReorderModal', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockBack.mockClear();
    mockShowToast.mockClear();
    mockSearchParams.date = '2026-05-04';
    latestDragEnd = undefined;
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('선택한 주에 표시되는 루틴만 정렬 전용 아이템으로 표시한다', async () => {
    const allRoutines = createMockRoutines(5);
    const weeklyRoutines = [allRoutines[1], allRoutines[3], allRoutines[4]];

    mockAxios.onGet('/routine/list/all').reply(200, {
      data: allRoutines,
    });
    mockAxios.onGet(/\/routine\/list\?date=2026-05-04/).reply(200, {
      data: weeklyRoutines,
    });

    const { findByText, queryByText } = render(<RoutineReorderModal />);

    expect(await findByText('테스트 루틴 2')).toBeOnTheScreen();
    expect(await findByText('테스트 루틴 4')).toBeOnTheScreen();
    expect(await findByText('테스트 루틴 5')).toBeOnTheScreen();
    expect(queryByText('테스트 루틴 1')).toBeNull();
    expect(queryByText('테스트 루틴 3')).toBeNull();
    expect(queryByText('인증 요청')).toBeNull();
  });

  it('주간 루틴만 드래그하고 전체 루틴 순서를 재구성해 저장 API에 전달한다', async () => {
    const allRoutines = createMockRoutines(5);
    const weeklyRoutines = [allRoutines[1], allRoutines[3], allRoutines[4]];

    mockAxios.onGet('/routine/list/all').reply(200, { data: allRoutines });
    mockAxios.onGet(/\/routine\/list\?date=2026-05-04/).reply(200, {
      data: weeklyRoutines,
    });
    mockAxios.onPatch('/routine/order').reply(200, {
      success: true,
      data: { message: '루틴 순서가 성공적으로 변경되었습니다.' },
      timestamp: '2026-04-22T00:00:00.000Z',
      path: '/api/routine/order',
    });

    const { findByText, getByText } = render(<RoutineReorderModal />);

    await findByText('테스트 루틴 2');

    await act(async () => {
      latestDragEnd?.({
        data: [weeklyRoutines[2], weeklyRoutines[0], weeklyRoutines[1]],
      });
    });

    await act(async () => {
      fireEvent.press(getByText('완료'));
    });

    await waitFor(() => {
      expect(mockAxios.history.patch[0]?.url).toBe('/routine/order');
      expect(JSON.parse(mockAxios.history.patch[0]?.data)).toEqual({
        routineIds: [1, 5, 3, 2, 4],
      });
      expect(mockShowToast).toHaveBeenCalledWith(
        '루틴 순서가 성공적으로 변경되었습니다.',
        'success',
      );
      expect(mockBack).toHaveBeenCalled();
    });
  });
});
