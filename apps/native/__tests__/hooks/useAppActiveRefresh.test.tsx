import * as requestApi from '@repo/shared/api/request.api';
import * as routineApi from '@repo/shared/api/routine.api';
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
    jest.spyOn(routineApi, 'fetchRoutines').mockResolvedValue([routine]);
    jest
      .spyOn(routineWidgetNative, 'saveRoutineWidgetSnapshot')
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

  it('앱이 다시 active가 되면 인증 요청 목록과 루틴 목록을 갱신한다', async () => {
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
});
