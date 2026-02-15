import type { FetchQuestsParams } from '../../api/quest.api';

export const questKeys = {
  all: ['quest'] as const,
  lists: () => [...questKeys.all, 'list'] as const,
  list: (params: FetchQuestsParams = {}) =>
    [...questKeys.lists(), params.status ?? 'ALL', params.questType ?? 'ALL'] as const,
  details: () => [...questKeys.all, 'detail'] as const,
  detail: (id: number) => [...questKeys.details(), id] as const,
};

export const rewardKeys = {
  all: ['reward'] as const,
  lists: () => [...rewardKeys.all, 'list'] as const,
  list: (filter: string) => [...rewardKeys.lists(), filter] as const,
  details: () => [...rewardKeys.all, 'detail'] as const,
  detail: (rewardId: number) => [...rewardKeys.details(), rewardId] as const,
};
