import {
  useAccpetQuestMutation,
  useCompleteQuestMutation,
} from '@repo/shared/hooks/useQuest';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

interface UseQuestActionParams {
  questId: number | null | undefined;
  isAccepted: boolean;
  isCompleted: boolean;
}

export const useQuestAction = ({
  questId,
  isAccepted,
  isCompleted,
}: UseQuestActionParams) => {
  const router = useRouter();
  const { showToast } = useToast();
  const acceptQuest = useAccpetQuestMutation();
  const completeQuest = useCompleteQuestMutation();

  const handleQuestAction = useCallback(() => {
    if (!questId) {
      return;
    }

    if (isAccepted && !isCompleted) {
      completeQuest.mutate(questId, {
        onSuccess: () => {
          showToast('완료되었습니다.', 'success');
          router.back();
        },
        onError: (error) => {
          const errorMessage = getApiErrorMessage(
            error,
            '퀘스트 완료에 실패했습니다.',
          );

          showToast(errorMessage, 'error');
        },
      });

      return;
    }

    acceptQuest.mutate(questId, {
      onSuccess: () => {
        showToast('수락되었습니다.', 'success');
        router.back();
      },
      onError: (error) => {
        const errorMessage = getApiErrorMessage(
          error,
          '이미 수락한 퀘스트입니다.',
        );

        showToast(errorMessage, 'error');
      },
    });
  }, [
    acceptQuest,
    completeQuest,
    isAccepted,
    isCompleted,
    questId,
    router,
    showToast,
  ]);

  return {
    handleQuestAction,
    isPending: acceptQuest.isPending || completeQuest.isPending,
  };
};
