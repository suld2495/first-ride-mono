import type { StatKey } from '@repo/types';

export const rankingKey = {
  all: () => ['ranking'] as const,
  level: () => [...rankingKey.all(), 'level'] as const,
  allLevel: (topN: number) => [...rankingKey.level(), 'all', topN] as const,
  friendLevel: () => [...rankingKey.level(), 'friends'] as const,
  stat: () => [...rankingKey.all(), 'stat'] as const,
  statType: (statType: StatKey, topN: number) =>
    [...rankingKey.stat(), statType, topN] as const,
  allStats: (topN: number) => [...rankingKey.stat(), 'all', topN] as const,
};
