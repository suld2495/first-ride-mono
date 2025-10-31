import { QuestTypeFilter } from '@repo/types';

export const questKeys = {
  all: ['quest'] as const,
  lists: () => [...questKeys.all, 'list'] as const,
  list: (filter: QuestTypeFilter) => [...questKeys.lists(), filter] as const,
  details: () => [...questKeys.all, 'detail'] as const,
  detail: (id: string) => [...questKeys.details(), id] as const,
};

export const rewardKeys = {
  all: ['reward'] as const,
  lists: () => [...rewardKeys.all, 'list'] as const,
  list: (filter: string) => [...rewardKeys.lists(), filter] as const,
  details: () => [...rewardKeys.all, 'detail'] as const,
  detail: (rewardId: number) => [...rewardKeys.details(), rewardId] as const,
};
