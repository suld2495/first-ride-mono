import type { User } from '@repo/types';

// ========================================
// User Mock Factory
// ========================================

export interface CreateMockUserOptions {
  userId?: string;
  nickname?: string;
}

export const createMockUser = (options: CreateMockUserOptions = {}): User => ({
  userId: options.userId ?? 'test123',
  nickname: options.nickname ?? 'testuser',
});

export const createMockUsers = (
  count: number,
  options: CreateMockUserOptions = {},
): User[] =>
  Array.from({ length: count }, (_, index) =>
    createMockUser({
      userId: options.userId ?? `user${index + 1}`,
      nickname: options.nickname ?? `user${index + 1}`,
    }),
  );
