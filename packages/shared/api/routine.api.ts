import type {
  Routine,
  RoutineActionResponse,
  RoutineForm,
  UpdateRoutineForm,
  UpdateRoutineOrderRequest,
  UpdateRoutinePauseRequest,
  UpdateRoutineVisibilityRequest,
} from '@repo/types';

import { toAppError } from '.';
import http from './client';

export const fetchRoutines = async (date: string): Promise<Routine[]> => {
  try {
    const response: Routine[] = await http.get(`/routine/list?date=${date}`);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchAllRoutines = async (): Promise<Routine[]> => {
  const responses = await Promise.allSettled([
    http.get<Routine[], void>('/routine/list/all'),
    http.get<Routine[], void>('/routine/list'),
  ]);
  const routinesById = new Map<Routine['routineId'], Routine>();

  responses.forEach((response) => {
    if (response.status !== 'fulfilled') {
      return;
    }

    response.value.forEach((routine) => {
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
};

export const fetchRoutineDetail = async (id: number): Promise<Routine> => {
  try {
    const query = `routineId=${encodeURIComponent(id)}`;

    const response: Routine = await http.get(`/routine/details?${query}`);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const createRoutine = async (form: RoutineForm): Promise<void> => {
  try {
    const response: void = await http.post('/routine', form);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateRoutine = async ({
  routineId,
  ...form
}: UpdateRoutineForm): Promise<void> => {
  try {
    const response: void = await http.put(`/routine/${routineId}`, form);

    return response;
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
