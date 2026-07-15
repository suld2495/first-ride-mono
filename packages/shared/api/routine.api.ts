import type {
  CreateRoutineRequest,
  MonthlyRoutineListRequest,
  MonthlyRoutineListResponse,
  RejectRoutineChangeRequest,
  Routine,
  RoutineActionResponse,
  RoutineChangeRequest,
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
  | 'hasPendingChangeRequest'
  | 'pendingChangeRequestId'
  | 'pendingChangeRequestStatus'
> & {
  successDate?: Routine['successDate'] | null;
  hasPendingConfirmation?: Routine['hasPendingConfirmation'] | null;
  pendingConfirmationCount?: Routine['pendingConfirmationCount'] | null;
  pendingConfirmationIds?: Routine['pendingConfirmationIds'] | null;
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
  hasPendingChangeRequest: Boolean(routine.hasPendingChangeRequest),
  pendingChangeRequestId: routine.pendingChangeRequestId ?? null,
  pendingChangeRequestStatus: routine.pendingChangeRequestStatus ?? null,
});

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
    return await http.get<
      MonthlyRoutineListResponse,
      MonthlyRoutineListRequest
    >('/routine/list/monthly', { params: request });
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
