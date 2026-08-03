import * as requestApi from '@repo/shared/api/request.api';
import * as routineApi from '@repo/shared/api/routine.api';
import * as statApi from '@repo/shared/api/stat.api';
import * as userApi from '@repo/shared/api/user.api';
import { requestKey } from '@repo/shared/types/query-keys/request';
import { routineKey } from '@repo/shared/types/query-keys/routine';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAppActiveRefresh } from '@/hooks/useAppActiveRefresh';
import * as routineWidgetNative from '@/widget/routine-widget-native';

const routine = {
  routineId: 1,
  nickname: 'tester',
  routineName: '물 마시기',
  routineDetail: '',
  penalty: 0,
  weeklyCount: 0,
  routineCount: 3,
  mateNickname: '',
  isMe: true,
  startDate: '2026-05-25',
  successDate: [],
  paused: false,
  hidden: false,
  hasPendingConfirmation: false,
  pendingConfirmationCount: 0,
  pendingConfirmationIds: [],
  todayConfirmStatus: null,
  todayConfirmId: null,
  canRequestToday: true,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = 'UseAppActiveRefreshTestWrapper';

  return Wrapper;
};

describe('useAppActiveRefresh', () => {
  let appStateChangeHandler: ((state: AppStateStatus) => void) | undefined;

  beforeEach(() => {
    appStateChangeHandler = undefined;
    jest.spyOn(requestApi, 'fetchReceivedRequests').mockResolvedValue([]);
    jest
      .spyOn(routineApi, 'fetchReceivedRoutineChangeRequests')
      .mockResolvedValue([]);
    jest.spyOn(routineApi, 'fetchRoutines').mockResolvedValue([routine]);
    jest
      .spyOn(routineWidgetNative, 'saveRoutineWidgetSnapshot')
      .mockResolvedValue();
    jest.spyOn(userApi, 'fetchMe').mockResolvedValue({
      userId: 'tester-id',
      nickname: 'tester',
      role: 'USER',
      motto: null,
      mottos: [],
      characterImageUrl: '/character.png',
      backgroundImageUrl: '/background.png',
    });
    jest.spyOn(statApi, 'fetchMyStats').mockResolvedValue({
      userId: 1,
      nickname: 'tester',
      currentLevel: 4,
      currentTotalExp: 26,
      currentLevelProgress: 6,
      expForNextLevel: 10,
      stats: {
        strength: 1,
        agility: 1,
        intelligence: 1,
        luck: 1,
        vitality: 1,
        mana: 1,
      },
      availablePoints: 0,
      totalPointsEarned: 0,
      totalPointsUsed: 0,
    });
    jest
      .spyOn(routineWidgetNative, 'saveCharacterWidgetSnapshot')
      .mockResolvedValue();
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, cb) => {
        appStateChangeHandler = cb;

        return {
          remove: jest.fn(),
        };
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('앱이 다시 active가 되면 인증 요청, 루틴 수정 요청, 루틴 목록을 갱신한다', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useAppActiveRefresh('tester'), {
      wrapper: createWrapper(queryClient),
    });

    appStateChangeHandler?.('background');
    appStateChangeHandler?.('active');

    await waitFor(() => {
      expect(requestApi.fetchReceivedRequests).toHaveBeenCalledTimes(1);
      expect(
        routineApi.fetchReceivedRoutineChangeRequests,
      ).toHaveBeenCalledTimes(1);
    });
    expect(queryClient.getQueryData(requestKey.receivedList('tester'))).toEqual(
      [],
    );
    expect(
      queryClient.getQueryData(routineKey.receivedChangeRequests('tester')),
    ).toEqual([]);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: routineKey.list('tester'),
    });
  });

  it('pathname에 routine이 없어도 앱이 다시 active가 되면 루틴 목록을 갱신한다', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useAppActiveRefresh('tester'), {
      wrapper: createWrapper(queryClient),
    });

    appStateChangeHandler?.('background');
    appStateChangeHandler?.('active');

    await waitFor(() => {
      expect(requestApi.fetchReceivedRequests).toHaveBeenCalledTimes(1);
    });
    expect(queryClient.getQueryData(requestKey.receivedList('tester'))).toEqual(
      [],
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: routineKey.list('tester'),
    });
  });

  it('앱이 다시 active가 되면 최신 루틴으로 위젯 스냅샷을 즉시 저장한다', async () => {
    const queryClient = createTestQueryClient();

    renderHook(() => useAppActiveRefresh('tester', 'green'), {
      wrapper: createWrapper(queryClient),
    });

    appStateChangeHandler?.('background');
    appStateChangeHandler?.('active');

    await waitFor(() => {
      expect(
        routineWidgetNative.saveRoutineWidgetSnapshot,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ready',
          items: [expect.objectContaining({ title: '물 마시기' })],
        }),
      );
    });
  });

  it('iOS 사용자 ID가 있으면 진입 시 캐릭터 위젯을 저장하고 active 복귀 시 갱신한다', async () => {
    const queryClient = createTestQueryClient();

    renderHook(() => useAppActiveRefresh('tester', 'blue', 'tester-id'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(
        routineWidgetNative.saveCharacterWidgetSnapshot,
      ).toHaveBeenCalledTimes(1);
    });

    appStateChangeHandler?.('background');
    appStateChangeHandler?.('active');

    await waitFor(() => {
      expect(
        routineWidgetNative.saveCharacterWidgetSnapshot,
      ).toHaveBeenCalledTimes(2);
    });
  });
});
