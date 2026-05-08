import type {
  Routine,
  RoutineActionResponse,
  RoutineForm,
  UpdateRoutineForm,
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
