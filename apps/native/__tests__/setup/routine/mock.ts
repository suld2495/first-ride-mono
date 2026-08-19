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
  mateNickname?: string;
  paused?: boolean;
  hidden?: boolean;
  hasPendingConfirmation?: boolean;
  pendingConfirmationCount?: number;
  pendingConfirmationIds?: number[];
  confirmations?: Routine['confirmations'];
  todayConfirmStatus?: Routine['todayConfirmStatus'];
  todayConfirmId?: number | null;
  canRequestToday?: boolean;
  hasPendingChangeRequest?: boolean;
  pendingChangeRequestId?: number | null;
  pendingChangeRequestStatus?: Routine['pendingChangeRequestStatus'];
  photoRequired?: boolean;
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
  paused: options.paused ?? false,
  hidden: options.hidden ?? false,
  hasPendingConfirmation: options.hasPendingConfirmation ?? false,
  pendingConfirmationCount: options.pendingConfirmationCount ?? 0,
  pendingConfirmationIds: options.pendingConfirmationIds ?? [],
  confirmations: options.confirmations ?? [],
  todayConfirmStatus: options.todayConfirmStatus ?? null,
  todayConfirmId: options.todayConfirmId ?? null,
  canRequestToday: options.canRequestToday ?? true,
  hasPendingChangeRequest: options.hasPendingChangeRequest ?? false,
  pendingChangeRequestId: options.pendingChangeRequestId ?? null,
  pendingChangeRequestStatus: options.pendingChangeRequestStatus ?? null,
  photoRequired: options.photoRequired ?? true,
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
  responderNickname?: string;
  routineName?: string;
  routineDetail?: string;
  imagePaths?: string[];
  createdAt?: string;
  checkStatus?: RoutineDetail['checkStatus'];
  message?: string | null;
  checkComment?: string | null;
  hasRequestMessage?: boolean;
  hasResponseComment?: boolean;
}

export const createMockRoutineDetail = (
  index: number = 0,
  options: CreateMockRoutineDetailOptions = {},
): RoutineDetail => ({
  id: index + 1,
  nickname: options.nickname ?? 'testuser',
  requesterNickname: options.requesterNickname ?? 'requester',
  responderNickname: options.responderNickname ?? 'responder',
  routineName: options.routineName ?? `테스트 루틴 ${index + 1}`,
  routineDetail: options.routineDetail ?? `테스트 루틴 ${index + 1} 상세`,
  imagePaths: options.imagePaths ?? ['https://example.com/image.jpg'],
  createdAt: options.createdAt ?? new Date().toISOString(),
  checkStatus: options.checkStatus ?? 'WAIT',
  message: options.message ?? null,
  checkComment: options.checkComment ?? null,
  hasRequestMessage:
    options.hasRequestMessage ?? Boolean(options.message?.trim()),
  hasResponseComment:
    options.hasResponseComment ?? Boolean(options.checkComment?.trim()),
});
