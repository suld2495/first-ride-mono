import type { StatKey } from '@repo/types';

export const rankingKeys = {
  all: () => ['ranking'] as const,
  level: () => [...rankingKeys.all(), 'level'] as const,
  allLevel: (topN: number) => [...rankingKeys.level(), 'all', topN] as const,
  friendLevel: () => [...rankingKeys.level(), 'friends'] as const,
  stat: () => [...rankingKeys.all(), 'stat'] as const,
  statType: (statType: StatKey, topN: number) =>
    [...rankingKeys.stat(), statType, topN] as const,
  allStats: (topN: number) => [...rankingKeys.stat(), 'all', topN] as const,
};
