import {
  useUpdateRoutinePauseMutation,
  useUpdateRoutineVisibilityMutation,
} from '@repo/shared/hooks/useRoutine';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

export const useRoutineManagement = (routineId: number, nickname: string) => {
  const { showToast } = useToast();
  const updatePause = useUpdateRoutinePauseMutation(nickname);
  const updateVisibility = useUpdateRoutineVisibilityMutation();

  const updateRoutinePause = useCallback(
    (paused: boolean) => {
      updatePause.mutate(
        { routineId, paused },
        {
          onSuccess: ({ message }) => {
            showToast(message, 'success');
          },
          onError: (error) => {
            showToast(
              getApiErrorMessage(error, '루틴 상태를 변경하지 못했습니다.'),
              'error',
            );
          },
        },
      );
    },
    [routineId, showToast, updatePause],
  );

  const updateRoutineVisibility = useCallback(
    (hidden: boolean) => {
      updateVisibility.mutate(
        { routineId, hidden },
        {
          onSuccess: ({ message }) => {
            showToast(message, 'success');
          },
          onError: (error) => {
            showToast(
              getApiErrorMessage(
                error,
                '루틴 표시 상태를 변경하지 못했습니다.',
              ),
              'error',
            );
          },
        },
      );
    },
    [routineId, showToast, updateVisibility],
  );

  return {
    updateRoutinePause,
    updateRoutineVisibility,
    isUpdatingPause: updatePause.isPending,
    isUpdatingVisibility: updateVisibility.isPending,
  };
};
