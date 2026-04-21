import * as requestApi from '@repo/shared/api/request.api';
import { requestKey } from '@repo/shared/types/query-keys/request';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import React from 'react';

import { useReceivedRequests } from '@/hooks/useReceivedRequests';

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

  Wrapper.displayName = 'UseReceivedRequestsTestWrapper';

  return Wrapper;
};

describe('useReceivedRequests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('인증 요청 목록 API 조회 성공 시 응답 길이로 앱 아이콘 배지를 갱신한다', async () => {
    const queryClient = createTestQueryClient();

    jest
      .spyOn(requestApi, 'fetchReceivedRequests')
      .mockResolvedValue([{ id: 1 }, { id: 2 }] as Awaited<
        ReturnType<typeof requestApi.fetchReceivedRequests>
      >);

    const { result } = renderHook(() => useReceivedRequests('tester'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
    });

    expect(requestApi.fetchReceivedRequests).toHaveBeenCalledTimes(1);
    expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(2);
    expect(
      queryClient.getQueryData(requestKey.receivedList('tester')),
    ).toHaveLength(2);
  });

  it('nickname이 없으면 인증 요청 목록 API와 배지 갱신을 실행하지 않는다', async () => {
    const queryClient = createTestQueryClient();
    const fetchSpy = jest.spyOn(requestApi, 'fetchReceivedRequests');

    const { result } = renderHook(() => useReceivedRequests(''), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(Notifications.setBadgeCountAsync).not.toHaveBeenCalled();
  });
});
