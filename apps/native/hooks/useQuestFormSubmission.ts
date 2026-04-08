import { useCreateQuestMutation } from '@repo/shared/hooks/useQuest';
import type { CreateQuestForm } from '@repo/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

export const useQuestFormSubmission = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const createQuestMutation = useCreateQuestMutation();

  const handleSubmit = useCallback(
    (data: CreateQuestForm) => {
      createQuestMutation.mutate(data, {
        onSuccess: () => {
          showToast('퀘스트가 생성되었습니다.', 'success');
          router.back();
        },
        onError: (error) => {
          const message = getApiErrorMessage(
            error,
            '퀘스트 생성에 실패했습니다.',
          );

          showToast(message, 'error');
        },
      });
    },
    [createQuestMutation, router, showToast],
  );

  return {
    handleSubmit,
    isPending: createQuestMutation.isPending,
  };
};
