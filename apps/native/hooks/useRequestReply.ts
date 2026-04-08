import { useReplyRequestMutation } from '@repo/shared/hooks/useRequest';
import type { RequestResponseStatus } from '@repo/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';

interface UseRequestReplyParams {
  confirmId: number | undefined;
  nickname: string;
}

export const useRequestReply = ({
  confirmId,
  nickname,
}: UseRequestReplyParams) => {
  const router = useRouter();
  const { showToast } = useToast();
  const replyRequest = useReplyRequestMutation(nickname);

  const handleSubmit = useCallback(
    (status: RequestResponseStatus, comment: string) => {
      if (!confirmId) {
        return;
      }

      replyRequest.mutate(
        {
          confirmId,
          checkStatus: status,
          checkComment: comment,
        },
        {
          onSuccess: () => {
            showToast(
              status === 'PASS' ? '승인되었습니다.' : '거절되었습니다.',
              'success',
            );
            router.back();
          },
          onError: () => {
            showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
          },
        },
      );
    },
    [confirmId, replyRequest, router, showToast],
  );

  return { handleSubmit };
};
