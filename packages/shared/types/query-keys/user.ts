import type { SearchOption } from '@repo/types';

export const userKey = {
  all: () => ['user'] as const,
  list: (option: SearchOption) => [...userKey.all(), option] as const,
  detail: (userId: number) => [...userKey.all(), userId] as const,
};
