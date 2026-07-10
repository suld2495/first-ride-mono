import {
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
} from '@repo/shared/hooks/useRoutine';
import type { CreateRoutineRequest, RoutineForm } from '@repo/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';

interface UseRoutineFormSubmissionParams {
  nickname: string;
  routineId: number;
  originalForm?: Pick<RoutineStatusSubmitForm, 'startDate' | 'endDate'>;
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

const normalizePenalty = (penalty: RoutineForm['penalty'] | string): number => {
  if (penalty === '') {
    return 0;
  }

  return Number(penalty) || 0;
};

const normalizeRoutineCreateRequest = (
  data: RoutineStatusSubmitForm,
): CreateRoutineRequest => {
  const payload = {
    routineName: data.routineName,
    startDate: data.startDate,
    routineDetail: data.routineDetail,
    routineCount: data.routineCount,
    symbolColor: data.symbolColor,
    ...(data.endDate ? { endDate: data.endDate } : {}),
  };

  if (data.isMe) {
    return {
      target: 'me',
      payload,
    };
  }

  return {
    target: 'mate',
    payload: {
      ...payload,
      penalty: normalizePenalty(data.penalty),
      mateNickname: data.mateNickname,
    },
  };
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
    penalty: normalizePenalty(data.penalty),
    routineCount: data.routineCount,
    symbolColor: data.symbolColor,
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

const omitUnchangedRoutineDateFields = (
  form: RoutineSubmitForm,
  originalForm?: Pick<RoutineStatusSubmitForm, 'startDate' | 'endDate'>,
): Partial<RoutineSubmitForm> => {
  if (!originalForm) {
    return form;
  }

  const nextForm: Partial<RoutineSubmitForm> = { ...form };

  if (originalForm.startDate === form.startDate) {
    delete nextForm.startDate;
  }

  if (originalForm.endDate === form.endDate) {
    delete nextForm.endDate;
  }

  return nextForm;
};

export const useRoutineFormSubmission = ({
  nickname,
  routineId,
  originalForm,
}: UseRoutineFormSubmissionParams) => {
  const router = useRouter();
  const toast = useToast();
  const saveMutation = useCreateRoutineMutation(nickname);
  const updateMutation = useUpdateRoutineMutation(nickname);

  const handleCreate = useCallback(
    (data: RoutineStatusSubmitForm) => {
      saveMutation.mutate(normalizeRoutineCreateRequest(data), {
        onSuccess: () => {
          toast.showToast('루틴이 생성되었습니다.');
          router.dismissTo('/(tabs)/(afterLogin)/(routine)');
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : '문제가 발생하였습니다.';

          toast.showToast(message, 'error');
        },
      });
    },
    [router, saveMutation, toast],
  );

  const handleUpdate = useCallback(
    (data: RoutineStatusSubmitForm) => {
      updateMutation.mutate(
        {
          ...omitUnchangedRoutineDateFields(
            normalizeRoutineSubmitForm(data, nickname),
            originalForm,
          ),
          routineId,
        },
        {
          onSuccess: () => {
            toast.showToast('루틴이 수정되었습니다.');
            router.dismissTo('/(tabs)/(afterLogin)/(routine)');
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
    [nickname, originalForm, routineId, router, toast, updateMutation],
  );

  return {
    handleCreate,
    handleUpdate,
    isPending: saveMutation.isPending || updateMutation.isPending,
  };
};
