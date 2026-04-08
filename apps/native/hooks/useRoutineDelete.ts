import { useDeleteRoutineMutation } from '@repo/shared/hooks/useRoutine';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';

export const useRoutineDelete = (routineId: number, nickname: string) => {
  const router = useRouter();
  const { showToast } = useToast();
  const deleteRoutine = useDeleteRoutineMutation(nickname);

  const deleteRoutineById = useCallback(() => {
    deleteRoutine.mutate(routineId, {
      onSuccess: () => {
        showToast('삭제되었습니다.', 'success');
        router.push('/(tabs)/(afterLogin)/(routine)');
      },
      onError: () => {
        showToast('문제가 발생하였습니다.', 'error');
      },
    });
  }, [deleteRoutine, routineId, router, showToast]);

  return { deleteRoutineById };
};
