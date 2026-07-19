import type { SearchOption, User } from '@repo/types';

export const userKey = {
  all: () => ['user'] as const,
  me: (userId: User['userId']) => [...userKey.all(), 'me', userId] as const,
  list: (option: SearchOption) => [...userKey.all(), option] as const,
  detail: (userId: number) => [...userKey.all(), userId] as const,
};
