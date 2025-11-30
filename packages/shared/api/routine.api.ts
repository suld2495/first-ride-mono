import { Routine, RoutineForm, UpdateRoutineForm } from '@repo/types';

import http from './client';
import { toAppError } from '.';

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
