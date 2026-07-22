import type { DistributeStatsRequest, User } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as statApi from '../api/stat.api';
import { statKey } from '../types/query-keys/stat';

export const useMyStatsQuery = (userId: User['userId']) => {
  return useQuery({
    queryKey: statKey.me(userId),
    queryFn: () => statApi.fetchMyStats(),
    enabled: !!userId,
    refetchOnMount: 'always',
  });
};

export const useDistributeStatsMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DistributeStatsRequest) =>
      statApi.distributeStats(request),
    onSuccess: async (stats) => {
      queryClient.setQueryData(statKey.me(userId), stats);
      await queryClient.invalidateQueries({
        queryKey: statKey.me(userId),
      });
    },
  });
};
