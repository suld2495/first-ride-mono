import type {
  CreateRoutineRequest,
  Routine,
  UpdateRoutineForm,
  UpdateRoutineOrderRequest,
  UpdateRoutinePauseRequest,
  UpdateRoutineVisibilityRequest,
  WeeklyRoutine,
} from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

import * as routineApi from '../api/routine.api';
import { routineKey } from '../types/query-keys/routine';
import { getWeekMonday } from '../utils/date-utils';

const DAYS_PER_WEEK = 7;
const SHORT_YEAR_OFFSET = 2000;
const PAD_LENGTH = 2;

type RoutineVisibilitySnapshot = Array<[QueryKey, unknown]>;

const isRoutineLike = (value: unknown): value is Pick<Routine, 'routineId'> =>
  typeof value === 'object' && value !== null && 'routineId' in value;

const updateRoutineVisibilityInCache = (
  data: unknown,
  { routineId, hidden }: UpdateRoutineVisibilityRequest,
): unknown => {
  if (Array.isArray(data)) {
    const routines: unknown[] = data;

    return routines.map((routine) =>
      isRoutineLike(routine) && routine.routineId === routineId
        ? { ...routine, hidden }
        : routine,
    );
  }

  if (isRoutineLike(data) && data.routineId === routineId) {
    return { ...data, hidden };
  }

  return data;
};

export const useRoutinesQuery = (nickname: string, date: string) => {
  return useQuery({
    queryKey: routineKey.listByDate(nickname, date),
    queryFn: () => routineApi.fetchRoutines(date),
    enabled: !!nickname && !!date,
    refetchOnMount: 'always',
  });
};

export const useAllRoutinesQuery = (nickname: string) => {
  return useQuery({
    queryKey: routineKey.allList(nickname),
    queryFn: () => routineApi.fetchAllRoutines(),
    enabled: !!nickname,
    refetchOnMount: 'always',
  });
};

export const usePausedRoutinesQuery = (nickname: string, enabled = true) => {
  return useQuery({
    queryKey: routineKey.pausedList(nickname),
    queryFn: () => routineApi.fetchPausedRoutines(),
    enabled: !!nickname && enabled,
    refetchOnMount: 'always',
  });
};

export const useCreateRoutineMutation = (nickname: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoutineRequest) => routineApi.createRoutine(data),

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

export const useCancelRoutineChangeRequestMutation = (
  nickname: string,
  routineId: number,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changeRequestId: number) =>
      routineApi.cancelRoutineChangeRequest(changeRequestId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: routineKey.list(nickname),
        }),
        queryClient.invalidateQueries({
          queryKey: routineKey.detail(routineId),
        }),
      ]);
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

export const useUpdateRoutinePauseMutation = (nickname: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoutinePauseRequest) =>
      routineApi.updateRoutinePause(data),

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: routineKey.list(nickname),
        }),
        queryClient.invalidateQueries({
          queryKey: routineKey.pausedList(nickname),
        }),
        queryClient.invalidateQueries({
          queryKey: routineKey.detail(variables.routineId),
        }),
      ]);
    },
  });
};

export const useUpdateRoutineVisibilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoutineVisibilityRequest) =>
      routineApi.updateRoutineVisibility(data),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: routineKey.all(),
      });

      const previousRoutineQueries: RoutineVisibilitySnapshot =
        queryClient.getQueriesData({
          queryKey: routineKey.all(),
        });

      previousRoutineQueries.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (data: unknown) =>
          updateRoutineVisibilityInCache(data, variables),
        );
      });

      return { previousRoutineQueries };
    },

    onError: (_error, _variables, context) => {
      context?.previousRoutineQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: routineKey.detail(variables.routineId),
        }),
        queryClient.invalidateQueries({
          queryKey: routineKey.all(),
          refetchType: 'inactive',
        }),
      ]);
    },
  });
};

export const useUpdateRoutineOrderMutation = (nickname: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoutineOrderRequest) =>
      routineApi.updateRoutineOrder(data),

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
    const day = newDate.getDate().toString().padStart(PAD_LENGTH, '0');

    return `${year}${month}${day}`;
  });
};

export const useWeeklyData = (
  routines: WeeklyRoutine[],
  date: string = getWeekMonday(new Date()),
): Record<Routine['routineId'], boolean[]> => {
  const weeklyDataByRoutineId = Object.create(null) as Record<
    Routine['routineId'],
    boolean[]
  >;
  const weekDates = createWeeklyData(date);

  return routines.reduce((acc, { routineId, successDate }) => {
    const successDateSet = new Set(successDate);
    const data = weekDates.map((weekDate) => successDateSet.has(weekDate));

    acc[routineId] = data;
    return acc;
  }, weeklyDataByRoutineId);
};
