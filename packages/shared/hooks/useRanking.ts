import type { StatKey } from '@repo/types';
import { useQuery } from '@tanstack/react-query';

import * as rankingApi from '../api/ranking.api';
import { rankingKeys } from '../types/query-keys/ranking';

interface RankingQueryOptions {
  enabled?: boolean;
}

export const useAllLevelRankingQuery = (
  topN = 50,
  options: RankingQueryOptions = {},
) => {
  return useQuery({
    queryKey: rankingKeys.allLevel(topN),
    queryFn: () => rankingApi.fetchAllLevelRanking(topN),
    enabled: options.enabled ?? true,
  });
};

export const useFriendLevelRankingQuery = (
  options: RankingQueryOptions = {},
) => {
  return useQuery({
    queryKey: rankingKeys.friendLevel(),
    queryFn: () => rankingApi.fetchFriendLevelRanking(),
    enabled: options.enabled ?? true,
  });
};

export const useStatRankingQuery = (
  statType: StatKey,
  topN = 10,
  options: RankingQueryOptions = {},
) => {
  return useQuery({
    queryKey: rankingKeys.statType(statType, topN),
    queryFn: () => rankingApi.fetchStatRanking(statType, topN),
    enabled: options.enabled ?? true,
  });
};

export const useAllStatRankingsQuery = (
  topN = 10,
  options: RankingQueryOptions = {},
) => {
  return useQuery({
    queryKey: rankingKeys.allStats(topN),
    queryFn: () => rankingApi.fetchAllStatRankings(topN),
    enabled: options.enabled ?? true,
  });
};
