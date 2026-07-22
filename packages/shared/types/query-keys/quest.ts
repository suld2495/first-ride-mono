import type { User } from '@repo/types';

import type { FetchQuestsParams } from '../../api/quest.api';

export const questKeys = {
  all: (userId: User['userId']) => ['quest', userId] as const,
  lists: (userId: User['userId']) =>
    [...questKeys.all(userId), 'list'] as const,
  list: (userId: User['userId'], params: FetchQuestsParams = {}) =>
    [
      ...questKeys.lists(userId),
      params.status ?? 'ALL',
      params.questType ?? 'ALL',
      params.completed ?? 'ALL',
    ] as const,
  details: (userId: User['userId']) =>
    [...questKeys.all(userId), 'detail'] as const,
  detail: (userId: User['userId'], id: number) =>
    [...questKeys.details(userId), id] as const,
};

export const rewardKeys = {
  all: (userId: User['userId']) => ['reward', userId] as const,
  lists: (userId: User['userId']) =>
    [...rewardKeys.all(userId), 'list'] as const,
  list: (userId: User['userId'], filter: string) =>
    [...rewardKeys.lists(userId), filter] as const,
  details: (userId: User['userId']) =>
    [...rewardKeys.all(userId), 'detail'] as const,
  detail: (userId: User['userId'], rewardId: number) =>
    [...rewardKeys.details(userId), rewardId] as const,
};
