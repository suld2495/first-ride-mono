import type { User, UserRole } from '@repo/types';

// ========================================
// User Mock Factory
// ========================================

export interface CreateMockUserOptions {
  motto?: null | string;
  mottos?: string[];
  userId?: string;
  nickname?: string;
  role?: UserRole;
}

export const createMockUser = (options: CreateMockUserOptions = {}): User => ({
  userId: options.userId ?? 'test123',
  nickname: options.nickname ?? 'testuser',
  motto: options.motto ?? '끝까지 간다',
  mottos:
    options.mottos ??
    [options.motto ?? '끝까지 간다'].filter(
      (motto): motto is string => !!motto,
    ),
  role: options.role ?? 'USER',
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
