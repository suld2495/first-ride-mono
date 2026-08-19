import axiosInstance from '@repo/shared/api';
import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import type { PropsWithChildren } from 'react';

describe('useFetchQuestsQuery', () => {
  const userId = 'account-a';
  let mockAxios: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: Infinity,
          retry: false,
          staleTime: Infinity,
        },
      },
    });
    mockAxios
      .onGet('/quest/list?status=ACTIVE&completed=false')
      .reply(200, { data: [] });
  });

  afterEach(() => {
    queryClient.clear();
    mockAxios.restore();
  });

  const createWrapper = (client: QueryClient) => {
    const TestQueryProvider = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    return TestQueryProvider;
  };

  it('캐시된 퀘스트 목록을 재마운트해도 API를 다시 호출한다', async () => {
    const wrapper = createWrapper(queryClient);
    const params = { status: 'ACTIVE' as const, completed: false };
    const firstRender = renderHook(
      () => useFetchQuestsQuery(userId, params),
      { wrapper },
    );

    await waitFor(() => expect(firstRender.result.current.data).toEqual([]));
    firstRender.unmount();

    renderHook(() => useFetchQuestsQuery(userId, params), { wrapper });

    await waitFor(() => {
      expect(mockAxios.history.get).toHaveLength(2);
    });
  });
});
