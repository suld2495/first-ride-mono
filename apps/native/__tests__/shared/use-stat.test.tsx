import axiosInstance from '@repo/shared/api';
import { useDistributeStatsMutation } from '@repo/shared/hooks/useStat';
import { statKey } from '@repo/shared/types/query-keys/stat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';

let mockAxios: MockAdapter;

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
  const TestQueryProvider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  TestQueryProvider.displayName = 'TestQueryProvider';

  return TestQueryProvider;
};

describe('useStat', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('useDistributeStatsMutation', () => {
    it('저장 성공 응답을 내 스탯 캐시에 즉시 반영한다', async () => {
      const queryClient = createTestQueryClient();
      const initialStats = {
        userId: 71,
        nickname: '맨날12',
        currentLevel: 9,
        currentTotalExp: 249,
        currentLevelProgress: 9,
        expForNextLevel: 21,
        stats: {
          strength: 0,
          agility: 0,
          intelligence: 0,
          luck: 0,
          vitality: 0,
          mana: 0,
        },
        availablePoints: 24,
        totalPointsEarned: 24,
        totalPointsUsed: 0,
      };
      const updatedStats = {
        ...initialStats,
        stats: {
          ...initialStats.stats,
          strength: 1,
          agility: 2,
        },
        availablePoints: 21,
        totalPointsUsed: 3,
      };

      queryClient.setQueryData(statKey.me(), initialStats);
      mockAxios.onPost('/stats/distribute').reply(200, {
        data: updatedStats,
      });

      const { result } = renderHook(() => useDistributeStatsMutation(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        distributions: {
          STRENGTH: 1,
          AGILITY: 2,
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(queryClient.getQueryData(statKey.me())).toEqual(updatedStats);
    });
  });
});
