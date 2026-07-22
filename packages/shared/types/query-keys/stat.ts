import type { User } from '@repo/types';

export const statKey = {
  all: (userId: User['userId']) => ['stat', userId] as const,
  me: (userId: User['userId']) => [...statKey.all(userId), 'me'] as const,
};
