import type { SearchOption } from '@repo/types';

export const friendKey = {
  all: () => ['friend'] as const,
  list: (option: SearchOption) => [...friendKey.all(), option] as const,
  detail: (friendId: number) => [...friendKey.all(), friendId] as const,
};

export const friendRequestKey = {
  all: () => ['friend-request'] as const,
  list: (page: number) => [...friendRequestKey.all(), page] as const,
};
