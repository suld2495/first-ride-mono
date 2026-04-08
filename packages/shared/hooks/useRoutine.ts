import type {
  Routine,
  RoutineForm,
  UpdateRoutineForm,
  WeeklyRoutine,
} from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as routineApi from '../api/routine.api';
import { routineKey } from '../types/query-keys/routine';
import { getWeekMonday } from '../utils/date-utils';

const DAYS_PER_WEEK = 7;
const SHORT_YEAR_OFFSET = 2000;
const PAD_LENGTH = 2;

export const useRoutinesQuery = (nickname: string, date: string) => {
  return useQuery({
    queryKey: routineKey.listByDate(nickname, date),
    queryFn: () => routineApi.fetchRoutines(date),
    enabled: !!nickname && !!date,
    refetchOnMount: 'always',
  });
};

export const useCreateRoutineMutation = (nickname: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoutineForm) => routineApi.createRoutine(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routineKey.list(nickname),
      });
    },
  });
};

export const useUpdateRoutineMutation = (nickname: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoutineForm) => routineApi.updateRoutine(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routineKey.list(nickname),
      });
    },
  });
};

export const useRoutineDetailQuery = (routineId: number) => {
  return useQuery({
    queryKey: routineKey.detail(routineId),
    queryFn: () => routineApi.fetchRoutineDetail(routineId),
    enabled: !!routineId,
  });
};

export const useDeleteRoutineMutation = (nickname: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routineId: number) => routineApi.deleteRoutine(routineId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routineKey.list(nickname),
      });
    },
  });
};

const createWeeklyData = (startDate: string): string[] => {
  const date = new Date(startDate);

  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
    const newDate = new Date(date);

    newDate.setDate(newDate.getDate() + i);

    const year = newDate.getFullYear() - SHORT_YEAR_OFFSET;
    const month = (newDate.getMonth() + 1).toString().padStart(PAD_LENGTH, '0');
    const day = newDate.getDate();

    return `${year}${month}${day}`;
  });
};

export const useWeeklyData = (
  routines: WeeklyRoutine[],
): Record<Routine['routineId'], boolean[]> => {
  const weeklyDataByRoutineId = Object.create(null) as Record<
    Routine['routineId'],
    boolean[]
  >;
  const weekDates = createWeeklyData(getWeekMonday(new Date()));

  return routines.reduce((acc, { routineId, successDate }) => {
    const successDateSet = new Set(successDate);
    const data = weekDates.map((date) => successDateSet.has(date));

    acc[routineId] = data;
    return acc;
  }, weeklyDataByRoutineId);
};
