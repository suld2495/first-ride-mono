import { getWeekMonday } from '@repo/shared/utils';
import type { Routine, RoutineDetail } from '@repo/types';

// ========================================
// Routine Mock Factory
// ========================================

export interface CreateMockRoutineOptions {
  weeklyCount?: number;
  routineCount?: number;
  isMe?: boolean;
  startDate?: string;
  endDate?: string;
  successDate?: string[];
  mateNickname?: string;
}

export const createMockRoutine = (
  index: number = 0,
  options: CreateMockRoutineOptions = {},
): Routine => ({
  routineId: index + 1,
  nickname: 'testuser',
  routineName: `테스트 루틴 ${index + 1}`,
  routineDetail: `테스트 루틴 ${index + 1} 상세`,
  penalty: 1000,
  weeklyCount: options.weeklyCount ?? 3,
  routineCount: options.routineCount ?? 5,
  mateNickname: options.mateNickname ?? 'mate',
  isMe: options.isMe ?? true,
  startDate: options.startDate ?? getWeekMonday(new Date()),
  endDate: options.endDate,
  successDate: options.successDate ?? ['251201', '251202', '251203'],
});

export const createMockRoutines = (
  count: number,
  options: CreateMockRoutineOptions = {},
): Routine[] =>
  Array.from({ length: count }, (_, index) =>
    createMockRoutine(index, options),
  );

// ========================================
// RoutineDetail Mock Factory
// ========================================

export interface CreateMockRoutineDetailOptions {
  nickname?: string;
  requesterNickname?: string;
  routineName?: string;
  routineDetail?: string;
  imagePath?: string;
  createdAt?: string;
}

export const createMockRoutineDetail = (
  index: number = 0,
  options: CreateMockRoutineDetailOptions = {},
): RoutineDetail => ({
  id: index + 1,
  nickname: options.nickname ?? 'testuser',
  requesterNickname: options.requesterNickname ?? 'requester',
  routineName: options.routineName ?? `테스트 루틴 ${index + 1}`,
  routineDetail: options.routineDetail ?? `테스트 루틴 ${index + 1} 상세`,
  imagePath: options.imagePath ?? 'https://example.com/image.jpg',
  createdAt: options.createdAt ?? new Date().toISOString(),
});
