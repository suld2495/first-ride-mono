import axiosInstance from '@repo/shared/api';
import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { userKey } from '@repo/shared/types/query-keys/user';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import type { PropsWithChildren } from 'react';

const currentUser = {
  userId: 'test123',
  nickname: 'testuser',
  motto: '끝까지 간다',
  mottos: ['끝까지 간다'],
  role: 'USER' as const,
  characterImageUrl: '/assets/characters/warrior.png',
  backgroundImageUrl: '/assets/backgrounds/warrior.webp',
};

describe('useFetchMeQuery', () => {
  let mockAxios: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockAxios.onGet('/users/me').reply(200, { data: currentUser });
  });

  afterEach(() => {
    queryClient.clear();
    mockAxios.restore();
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('동일 사용자의 프로필을 재마운트해도 캐시에서 재사용한다', async () => {
    const firstRender = renderHook(() => useFetchMeQuery(currentUser.userId), {
      wrapper,
    });

    await waitFor(() => {
      expect(firstRender.result.current.data).toEqual(currentUser);
    });
    firstRender.unmount();

    const secondRender = renderHook(() => useFetchMeQuery(currentUser.userId), {
      wrapper,
    });

    await waitFor(() => {
      expect(secondRender.result.current.data).toEqual(currentUser);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockAxios.history.get).toHaveLength(1);
  });

  it('로그인 사용자가 없으면 프로필을 요청하지 않는다', async () => {
    const { result } = renderHook(() => useFetchMeQuery(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockAxios.history.get).toHaveLength(0);
  });

  it('다른 사용자로 전환하면 독립된 캐시 키로 조회한다', async () => {
    const { result, rerender } = renderHook(
      ({ userId }: { userId: string }) => useFetchMeQuery(userId),
      {
        initialProps: { userId: currentUser.userId },
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(currentUser);
    });

    rerender({ userId: 'another-user' });

    await waitFor(() => {
      expect(mockAxios.history.get).toHaveLength(2);
    });
  });

  it('좌우명 수정 응답을 현재 사용자 캐시에 바로 반영한다', async () => {
    const updatedUser = { ...currentUser, motto: '한 번 더 나아가자' };
    queryClient.setQueryData(userKey.me(currentUser.userId), currentUser);
    mockAxios
      .onPut('/users/me/motto', { motto: updatedUser.motto })
      .reply(200, {
        success: true,
        data: updatedUser,
        error: null,
        path: '/api/users/me/motto',
        timestamp: '2026-07-24T15:38:40.765+09:00',
      });

    const { result } = renderHook(() => useUpdateMottoMutation(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ motto: updatedUser.motto });
    });

    expect(queryClient.getQueryData(userKey.me(currentUser.userId))).toEqual(
      updatedUser,
    );
    expect(mockAxios.history.get).toHaveLength(0);
  });
});
