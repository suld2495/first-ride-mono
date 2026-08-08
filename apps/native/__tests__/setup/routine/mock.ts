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
  paused?: boolean;
  hidden?: boolean;
  hasPendingConfirmation?: boolean;
  pendingConfirmationCount?: number;
  pendingConfirmationIds?: number[];
  pendingConfirmations?: Routine['pendingConfirmations'];
  confirmations?: Routine['confirmations'];
  todayConfirmStatus?: Routine['todayConfirmStatus'];
  todayConfirmId?: number | null;
  canRequestToday?: boolean;
  hasPendingChangeRequest?: boolean;
  pendingChangeRequestId?: number | null;
  pendingChangeRequestStatus?: Routine['pendingChangeRequestStatus'];
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
  paused: options.paused ?? false,
  hidden: options.hidden ?? false,
  hasPendingConfirmation: options.hasPendingConfirmation ?? false,
  pendingConfirmationCount: options.pendingConfirmationCount ?? 0,
  pendingConfirmationIds: options.pendingConfirmationIds ?? [],
  pendingConfirmations: options.pendingConfirmations ?? [],
  confirmations: options.confirmations ?? [],
  todayConfirmStatus: options.todayConfirmStatus ?? null,
  todayConfirmId: options.todayConfirmId ?? null,
  canRequestToday: options.canRequestToday ?? true,
  hasPendingChangeRequest: options.hasPendingChangeRequest ?? false,
  pendingChangeRequestId: options.pendingChangeRequestId ?? null,
  pendingChangeRequestStatus: options.pendingChangeRequestStatus ?? null,
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
  imagePaths?: string[];
  createdAt?: string;
  checkStatus?: RoutineDetail['checkStatus'];
  message?: string | null;
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
  imagePaths: options.imagePaths ?? ['https://example.com/image.jpg'],
  createdAt: options.createdAt ?? new Date().toISOString(),
  checkStatus: options.checkStatus ?? 'WAIT',
  message: options.message ?? null,
});
