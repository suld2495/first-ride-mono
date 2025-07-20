import { Routine, RoutineForm, UpdateRoutineForm } from '@repo/types';

import http from '.';

export const fetchRoutines = async (
  nickname: string,
  date: string,
): Promise<Routine[]> => {
  return http.get(`/routine/list?date=${date}&nickname=${nickname}`);
};

export const fetchRoutineDetail = async (id: number): Promise<Routine> => {
  const params = new URLSearchParams();

  params.append('routineId', id.toString());

  return http.get(`/routine/details?${params.toString()}`);
};

export const createRoutine = async (form: RoutineForm): Promise<void> => {
  return http.post('/routine', form);
};

export const updateRoutine = async ({
  routineId,
  ...form
}: UpdateRoutineForm): Promise<void> => {
  return http.put(`/routine/${routineId}`, form);
};

export const deleteRoutine = async (id: number): Promise<void> => {
  return http.delete(`/routine/${id}`);
};
