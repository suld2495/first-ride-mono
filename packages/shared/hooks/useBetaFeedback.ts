import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBetaFeedback } from '../api/beta-feedback.api';

const betaFeedbackKeys = {
  all: () => ['beta-feedback'] as const,
};

export const useCreateBetaFeedbackMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBetaFeedback,
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({
          queryKey: betaFeedbackKeys.all(),
        });
      } catch {
        // 피드백 저장 결과는 캐시 무효화 실패로 되돌리지 않는다.
      }
    },
  });
};
