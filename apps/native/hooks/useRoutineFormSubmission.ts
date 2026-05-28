import {
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
} from '@repo/shared/hooks/useRoutine';
import type { RoutineForm } from '@repo/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';

interface UseRoutineFormSubmissionParams {
  nickname: string;
  routineId: number;
}

type RoutineSubmitForm = Omit<RoutineForm, 'mateNickname'> & {
  mateNickname?: RoutineForm['mateNickname'];
  hidden?: boolean;
  paused?: boolean;
};

type RoutineStatusSubmitForm = RoutineForm & {
  hidden?: boolean;
  paused?: boolean;
};

const normalizeRoutineSubmitForm = (
  data: RoutineStatusSubmitForm,
  nickname: string,
): RoutineSubmitForm => {
  const form: RoutineSubmitForm = {
    nickname,
    routineName: data.routineName,
    startDate: data.startDate,
    endDate: data.endDate,
    routineDetail: data.routineDetail,
    penalty: data.penalty,
    routineCount: data.routineCount,
    isMe: data.isMe,
  };

  if (!data.isMe) {
    form.mateNickname = data.mateNickname;
  }

  if (typeof data.paused === 'boolean') {
    form.paused = data.paused;
  }

  if (typeof data.hidden === 'boolean') {
    form.hidden = data.hidden;
  }

  return form;
};

export const useRoutineFormSubmission = ({
  nickname,
  routineId,
}: UseRoutineFormSubmissionParams) => {
  const router = useRouter();
  const toast = useToast();
  const saveMutation = useCreateRoutineMutation(nickname);
  const updateMutation = useUpdateRoutineMutation(nickname);

  const handleCreate = useCallback(
    (data: RoutineStatusSubmitForm) => {
      saveMutation.mutate(
        normalizeRoutineSubmitForm(data, nickname) as RoutineForm,
        {
          onSuccess: () => {
            toast.showToast('루틴이 생성되었습니다.');
            router.back();
          },
          onError: (error) => {
            const message =
              error instanceof Error ? error.message : '문제가 발생하였습니다.';

            toast.showToast(message, 'error');
          },
        },
      );
    },
    [nickname, router, saveMutation, toast],
  );

  const handleUpdate = useCallback(
    (data: RoutineStatusSubmitForm) => {
      updateMutation.mutate(
        {
          ...normalizeRoutineSubmitForm(data, nickname),
          routineId,
        },
        {
          onSuccess: () => {
            toast.showToast('루틴이 수정되었습니다.');
            router.back();
          },
          onError: (error) => {
            const message =
              error instanceof Error
                ? error.message
                : '루틴 수정에 실패했습니다.';

            toast.showToast(message, 'error');
          },
        },
      );
    },
    [nickname, routineId, router, toast, updateMutation],
  );

  return {
    handleCreate,
    handleUpdate,
    isPending: saveMutation.isPending || updateMutation.isPending,
  };
};
