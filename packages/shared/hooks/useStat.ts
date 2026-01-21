import type { DistributeStatsRequest } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as statApi from '../api/stat.api';
import { statKey } from '../types/query-keys/stat';

export const useMyStatsQuery = () => {
  return useQuery({
    queryKey: statKey.me(),
    queryFn: () => statApi.fetchMyStats(),
    refetchOnMount: 'always',
  });
};

export const useDistributeStatsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DistributeStatsRequest) =>
      statApi.distributeStats(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: statKey.me(),
      });
    },
  });
};
