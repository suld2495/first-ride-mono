import { useReplyRequestMutation } from '@repo/shared/hooks/useRequest';
import type { RequestResponseStatus } from '@repo/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';

import { useToast } from '@/contexts/ToastContext';
import { syncBadgeCountWithPendingConfirmations } from '@/utils/notifications';

interface UseRequestReplyParams {
  confirmId: number | undefined;
  nickname: string;
}

export const useRequestReply = ({
  confirmId,
  nickname,
}: UseRequestReplyParams) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const replyRequest = useReplyRequestMutation(nickname);
  const isReplyingRef = useRef(false);

  const handleSubmit = useCallback(
    (status: RequestResponseStatus, comment: string) => {
      if (isReplyingRef.current || !confirmId) {
        return;
      }

      isReplyingRef.current = true;

      replyRequest.mutate(
        {
          confirmId,
          checkStatus: status,
          checkComment: comment,
        },
        {
          onSuccess: async () => {
            await syncBadgeCountWithPendingConfirmations(queryClient, nickname);
            showToast(
              status === 'PASS' ? '승인되었습니다.' : '거절되었습니다.',
              'success',
            );
            router.back();
          },
          onError: () => {
            showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
          },
          onSettled: () => {
            isReplyingRef.current = false;
          },
        },
      );
    },
    [confirmId, nickname, queryClient, replyRequest, router, showToast],
  );

  return {
    handleSubmit,
    isPending: replyRequest.isPending,
    pendingStatus: replyRequest.isPending
      ? replyRequest.variables?.checkStatus
      : undefined,
  };
};
