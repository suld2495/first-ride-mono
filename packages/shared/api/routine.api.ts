import type {
  CreateRoutineRequest,
  MonthlyRoutineListRequest,
  MonthlyRoutineListResponse,
  MonthlyRoutineStatus,
  RejectRoutineChangeRequest,
  Routine,
  RoutineActionResponse,
  RoutineChangeRequest,
  RoutineMonthlySummary,
  UpdateRoutineForm,
  UpdateRoutineOrderRequest,
  UpdateRoutinePauseRequest,
  UpdateRoutineResponse,
  UpdateRoutineVisibilityRequest,
} from '@repo/types';

import { toAppError } from '.';
import http from './client';

type RoutineResponse = Omit<
  Routine,
  | 'successDate'
  | 'hasPendingConfirmation'
  | 'pendingConfirmationCount'
  | 'pendingConfirmationIds'
  | 'pendingConfirmations'
  | 'confirmations'
  | 'todayConfirmStatus'
  | 'todayConfirmId'
  | 'canRequestToday'
  | 'hasPendingChangeRequest'
  | 'pendingChangeRequestId'
  | 'pendingChangeRequestStatus'
> & {
  successDate?: Routine['successDate'] | null;
  hasPendingConfirmation?: Routine['hasPendingConfirmation'] | null;
  pendingConfirmationCount?: Routine['pendingConfirmationCount'] | null;
  pendingConfirmationIds?: Routine['pendingConfirmationIds'] | null;
  pendingConfirmations?: Routine['pendingConfirmations'] | null;
  confirmations?: Routine['confirmations'] | null;
  todayConfirmStatus?: Routine['todayConfirmStatus'];
  todayConfirmId?: Routine['todayConfirmId'];
  canRequestToday?: Routine['canRequestToday'] | null;
  hasPendingChangeRequest?: Routine['hasPendingChangeRequest'] | null;
  pendingChangeRequestId?: Routine['pendingChangeRequestId'];
  pendingChangeRequestStatus?: Routine['pendingChangeRequestStatus'];
};

const normalizeRoutine = (routine: RoutineResponse): Routine => ({
  ...routine,
  successDate: Array.isArray(routine.successDate) ? routine.successDate : [],
  hasPendingConfirmation: Boolean(routine.hasPendingConfirmation),
  pendingConfirmationCount: routine.pendingConfirmationCount ?? 0,
  pendingConfirmationIds: Array.isArray(routine.pendingConfirmationIds)
    ? routine.pendingConfirmationIds
    : [],
  pendingConfirmations: Array.isArray(routine.pendingConfirmations)
    ? routine.pendingConfirmations
    : [],
  confirmations: Array.isArray(routine.confirmations)
    ? routine.confirmations
    : [],
  todayConfirmStatus: routine.todayConfirmStatus ?? null,
  todayConfirmId: routine.todayConfirmId ?? null,
  canRequestToday: routine.canRequestToday ?? true,
  hasPendingChangeRequest: Boolean(routine.hasPendingChangeRequest),
  pendingChangeRequestId: routine.pendingChangeRequestId ?? null,
  pendingChangeRequestStatus: routine.pendingChangeRequestStatus ?? null,
});

const MONTHLY_ROUTINE_STATUSES = new Set<MonthlyRoutineStatus>([
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const getNullableString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const getNumber = (value: unknown, fallback = 0): number => {
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const getMonthlyStatus = (value: unknown): MonthlyRoutineStatus =>
  typeof value === 'string' &&
  MONTHLY_ROUTINE_STATUSES.has(value as MonthlyRoutineStatus)
    ? (value as MonthlyRoutineStatus)
    : 'ACTIVE';

const getMonthlyAchievedDates = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((date): date is string => typeof date === 'string');
};

const normalizeMonthlyRoutine = (
  value: unknown,
  index: number,
): RoutineMonthlySummary => {
  const routine = isRecord(value) ? value : {};
  const achievedDates = getMonthlyAchievedDates(routine.achievedDates);
  const displayOrder = getNumber(routine.displayOrder, Number.NaN);

  return {
    routineId: Math.floor(getNumber(routine.routineId, -(index + 1))),
    routineName: getString(routine.routineName, '이름 없는 루틴'),
    routineDetail: getString(routine.routineDetail),
    category: getString(routine.category),
    symbolColor: getNullableString(routine.symbolColor),
    penalty: Math.max(0, getNumber(routine.penalty)),
    routineCount: Math.max(0, Math.floor(getNumber(routine.routineCount))),
    mateNickname: getNullableString(routine.mateNickname),
    startDate: getNullableString(routine.startDate),
    endDate: getNullableString(routine.endDate),
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : null,
    paused: Boolean(routine.paused),
    hidden: Boolean(routine.hidden),
    completed: Boolean(routine.completed),
    status: getMonthlyStatus(routine.status),
    achievedDates,
    monthlyAchievedCount: Math.max(
      0,
      Math.floor(getNumber(routine.monthlyAchievedCount, achievedDates.length)),
    ),
  };
};

const normalizeMonthlyRoutineListResponse = (
  value: unknown,
): MonthlyRoutineListResponse => {
  const response = isRecord(value) ? value : {};
  const routines = Array.isArray(response.routines)
    ? response.routines.map(normalizeMonthlyRoutine)
    : [];

  return {
    year: Math.floor(getNumber(response.year)),
    month: Math.floor(getNumber(response.month)),
    startDate: getString(response.startDate),
    endDate: getString(response.endDate),
    activeOnly: Boolean(response.activeOnly),
    routines,
  };
};

export const fetchRoutines = async (date: string): Promise<Routine[]> => {
  try {
    const response: RoutineResponse[] = await http.get(
      `/routine/list?date=${date}`,
    );

    return response.map(normalizeRoutine);
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchAllRoutines = async (): Promise<Routine[]> => {
  try {
    const responses = await Promise.allSettled([
      http.get<RoutineResponse[], void>('/routine/list/all'),
      http.get<RoutineResponse[], void>('/routine/list'),
    ]);
    const routinesById = new Map<Routine['routineId'], Routine>();

    responses.forEach((response) => {
      if (response.status !== 'fulfilled') {
        return;
      }

      response.value.map(normalizeRoutine).forEach((routine) => {
        routinesById.set(routine.routineId, routine);
      });
    });

    if (routinesById.size) {
      return Array.from(routinesById.values());
    }

    const rejectedResponse = responses.find(
      (response) => response.status === 'rejected',
    );

    throw toAppError(
      rejectedResponse?.status === 'rejected'
        ? rejectedResponse.reason
        : new Error('루틴 목록을 조회하지 못했습니다.'),
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchMonthlyRoutines = async (
  request: MonthlyRoutineListRequest,
): Promise<MonthlyRoutineListResponse> => {
  try {
    const response: unknown = await http.get<
      MonthlyRoutineListResponse,
      MonthlyRoutineListRequest
    >('/routine/list/monthly', { params: request });

    return normalizeMonthlyRoutineListResponse(response);
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchPausedRoutines = async (): Promise<Routine[]> => {
  try {
    const response: RoutineResponse[] = await http.get('/routine/list/paused');

    return response.map(normalizeRoutine);
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchRoutineDetail = async (id: number): Promise<Routine> => {
  try {
    const query = `routineId=${encodeURIComponent(id)}`;

    const response: RoutineResponse = await http.get(
      `/routine/details?${query}`,
    );

    return normalizeRoutine(response);
  } catch (error) {
    throw toAppError(error);
  }
};

export const createRoutine = async ({
  target,
  payload,
}: CreateRoutineRequest): Promise<void> => {
  try {
    await http.post<void, CreateRoutineRequest['payload']>(
      `/routine/${target}`,
      payload,
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateRoutine = async ({
  routineId,
  ...form
}: UpdateRoutineForm): Promise<UpdateRoutineResponse> => {
  try {
    const response = await http.put<UpdateRoutineResponse, typeof form>(
      `/routine/${routineId}`,
      form,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const cancelRoutineChangeRequest = async (
  changeRequestId: number,
): Promise<void> => {
  try {
    await http.delete<void, void>(
      `/routine/change-requests/${changeRequestId}`,
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchReceivedRoutineChangeRequests = async (): Promise<
  RoutineChangeRequest[]
> => {
  try {
    return await http.get<RoutineChangeRequest[], void>(
      '/routine/change-requests/received',
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const approveRoutineChangeRequest = async (
  changeRequestId: number,
): Promise<void> => {
  try {
    await http.post<void, void>(
      `/routine/change-requests/${changeRequestId}/approve`,
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const rejectRoutineChangeRequest = async (
  changeRequestId: number,
  data: RejectRoutineChangeRequest = {},
): Promise<void> => {
  try {
    await http.post<void, RejectRoutineChangeRequest>(
      `/routine/change-requests/${changeRequestId}/reject`,
      data,
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const deleteRoutine = async (id: number): Promise<void> => {
  try {
    const response: void = await http.delete(`/routine/${id}`);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateRoutinePause = async ({
  routineId,
  paused,
}: UpdateRoutinePauseRequest): Promise<RoutineActionResponse> => {
  try {
    const response: RoutineActionResponse = await http.patch(
      `/routine/${routineId}/pause`,
      { paused },
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateRoutineVisibility = async ({
  routineId,
  hidden,
}: UpdateRoutineVisibilityRequest): Promise<RoutineActionResponse> => {
  try {
    const response: RoutineActionResponse = await http.patch(
      `/routine/${routineId}/visibility`,
      {
        hidden,
      },
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateRoutineOrder = async ({
  routineIds,
}: UpdateRoutineOrderRequest): Promise<RoutineActionResponse> => {
  try {
    const response: RoutineActionResponse = await http.patch('/routine/order', {
      routineIds,
    });

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};
