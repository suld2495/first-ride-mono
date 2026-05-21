import * as requestApi from '@repo/shared/api/request.api';
import { requestKey } from '@repo/shared/types/query-keys/request';
import { routineKey } from '@repo/shared/types/query-keys/routine';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAppActiveRefresh } from '@/hooks/useAppActiveRefresh';

const mockUsePathname = jest.fn();

jest.mock('expo-router', () => ({
  usePathname: () => mockUsePathname(),
}));

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
    mockUsePathname.mockReturnValue('/(tabs)/(afterLogin)/(routine)');
    jest.spyOn(requestApi, 'fetchReceivedRequests').mockResolvedValue([]);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, cb) => {
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

  it('앱이 다시 active가 되면 인증 요청 목록을 갱신하고 루틴 페이지에서는 루틴 목록도 갱신한다', async () => {
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

  it('루틴 페이지가 아니어도 앱이 다시 active가 되면 인증 요청 목록을 갱신한다', async () => {
    mockUsePathname.mockReturnValue('/(tabs)/(afterLogin)/(stat)');
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
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: routineKey.list('tester'),
    });
  });
});
