import type { SearchOption, User } from '@repo/types';

export const friendKey = {
  all: () => ['friend'] as const,
  list: (option: SearchOption) => [...friendKey.all(), option] as const,
  detail: (friendId: number | string) =>
    [...friendKey.all(), friendId] as const,
  profile: (friendId: number | string) =>
    [...friendKey.detail(friendId), 'profile'] as const,
  routines: (friendId: number | string, date: string) =>
    [...friendKey.detail(friendId), 'routines', { date }] as const,
};

export const friendRequestKey = {
  all: (userId: User['userId']) => ['friend-request', userId] as const,
  list: (userId: User['userId'], page: number) =>
    [...friendRequestKey.all(userId), page] as const,
};
