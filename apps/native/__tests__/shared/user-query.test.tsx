import axiosInstance from '@repo/shared/api';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
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
});
