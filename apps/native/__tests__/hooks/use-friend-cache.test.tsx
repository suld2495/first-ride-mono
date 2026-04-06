import React from 'react';
import * as friendApi from '@repo/shared/api/friend';
import {
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from '@repo/shared/hooks/useFriend';
import { friendRequestKey } from '@repo/shared/types/query-keys/friend';
import { FriendRequestResponse } from '@repo/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  Wrapper.displayName = 'UseFriendCacheTestWrapper';

  return Wrapper;
};

const createMockRequest = (id: number): FriendRequestResponse => ({
  id,
  senderNickname: `sender${id}`,
  receiverNickname: 'receiver',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
});

describe('친구 요청 캐시 갱신', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('승인 시 친구 요청 캐시에서 해당 요청을 즉시 제거한다', async () => {
    const queryClient = createTestQueryClient();
    const requests = [createMockRequest(1), createMockRequest(2)];

    queryClient.setQueryData(friendRequestKey.list(1), requests);

    jest.spyOn(friendApi, 'acceptFriendRequest').mockResolvedValue(undefined);

    const { result } = renderHook(() => useAcceptFriendRequestMutation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(
      queryClient.getQueryData<FriendRequestResponse[]>(
        friendRequestKey.list(1),
      ),
    ).toEqual([requests[1]]);
  });

  it('거절 시 친구 요청 캐시에서 해당 요청을 즉시 제거한다', async () => {
    const queryClient = createTestQueryClient();
    const requests = [createMockRequest(1), createMockRequest(2)];

    queryClient.setQueryData(friendRequestKey.list(1), requests);

    jest.spyOn(friendApi, 'rejectFriendRequest').mockResolvedValue(undefined);

    const { result } = renderHook(() => useRejectFriendRequestMutation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(2);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(
      queryClient.getQueryData<FriendRequestResponse[]>(
        friendRequestKey.list(1),
      ),
    ).toEqual([requests[0]]);
  });
});
