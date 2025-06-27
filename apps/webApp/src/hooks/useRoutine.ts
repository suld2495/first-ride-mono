import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as routineApi from '@/api/routine.api';
import { routineKey } from '@/types/query-keys/routine';
import { getWeekMonday } from '@/utils/date-utils';

export const useRoutinesQuery = (nickname: string, date: string) => {
  return useQuery({
    queryKey: [...routineKey.list(nickname), { date }],
    queryFn: () => routineApi.fetchRoutines(nickname, date),
    initialData: [],
    enabled: !!nickname && !!date,
  });
};

export const useCreateRoutineMutation = (nickname: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: routineApi.RoutineForm) =>
      routineApi.createRoutine(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...routineKey.list(nickname)],
      });
    },
  });
};

export const useUpdateRoutineMutation = (nickname: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: routineApi.RoutineUpdateForm) =>
      routineApi.updateRoutine(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...routineKey.list(nickname)],
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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...routineKey.list(nickname)],
      });
    },
  });
};

const createWeeklyData = (startDate: string): string[] => {
  const date = new Date(startDate);

  return Array.from({ length: 7 }, (_, i) => {
    const newDate = new Date(date);

    newDate.setDate(newDate.getDate() + i + 1);

    const year = newDate.getFullYear() - 2000;
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const day = newDate.getDate();

    return `${year}${month}${day}`;
  });
};

export const useWeeklyData = (routines: routineApi.Routine[]): boolean[][] => {
  return routines.map(({ successDate }) =>
    createWeeklyData(getWeekMonday(new Date())).map((date) =>
      successDate.includes(date),
    ),
  );
};
