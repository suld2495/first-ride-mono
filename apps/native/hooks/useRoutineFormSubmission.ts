import {
  useCancelRoutineChangeRequestMutation,
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
} from '@repo/shared/hooks/useRoutine';
import type {
  CreateRoutineRequest,
  RoutineForm,
  UpdateRoutinePayload,
} from '@repo/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useToast } from '@/contexts/ToastContext';

interface UseRoutineFormSubmissionParams {
  nickname: string;
  routineId: number;
  originalForm?: RoutineStatusSubmitForm;
  initialPendingChangeRequestId?: number | null;
}

type RoutineStatusSubmitForm = RoutineForm & {
  hidden?: boolean;
  paused?: boolean;
};

type EditableRoutineUpdateValues = Pick<
  UpdateRoutinePayload,
  | 'routineName'
  | 'routineDetail'
  | 'penalty'
  | 'routineCount'
  | 'startDate'
  | 'endDate'
  | 'symbolColor'
  | 'hidden'
  | 'paused'
>;

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

const normalizeRoutineUpdateValues = (
  data: RoutineStatusSubmitForm,
): EditableRoutineUpdateValues => {
  const values: EditableRoutineUpdateValues = {
    routineName: data.routineName,
    startDate: data.startDate,
    endDate: data.endDate,
    routineDetail: data.routineDetail,
    penalty: normalizePenalty(data.penalty),
    routineCount: data.routineCount,
    symbolColor: data.symbolColor,
  };

  if (typeof data.paused === 'boolean') {
    values.paused = data.paused;
  }

  if (typeof data.hidden === 'boolean') {
    values.hidden = data.hidden;
  }

  return values;
};

const buildChangedRoutinePayload = (
  data: RoutineStatusSubmitForm,
  originalForm?: RoutineStatusSubmitForm,
): UpdateRoutinePayload => {
  const values = normalizeRoutineUpdateValues(data);

  if (!originalForm) {
    return values;
  }

  const originalValues = normalizeRoutineUpdateValues(originalForm);

  return {
    ...(values.routineName !== originalValues.routineName
      ? { routineName: values.routineName }
      : {}),
    ...(values.routineDetail !== originalValues.routineDetail
      ? { routineDetail: values.routineDetail }
      : {}),
    ...(values.penalty !== originalValues.penalty
      ? { penalty: values.penalty }
      : {}),
    ...(values.routineCount !== originalValues.routineCount
      ? { routineCount: values.routineCount }
      : {}),
    ...(values.startDate !== originalValues.startDate
      ? { startDate: values.startDate }
      : {}),
    ...(values.endDate !== originalValues.endDate
      ? { endDate: values.endDate }
      : {}),
    ...(values.symbolColor !== originalValues.symbolColor
      ? { symbolColor: values.symbolColor }
      : {}),
    ...(values.hidden !== originalValues.hidden
      ? { hidden: values.hidden }
      : {}),
    ...(values.paused !== originalValues.paused
      ? { paused: values.paused }
      : {}),
  };
};

export const useRoutineFormSubmission = ({
  nickname,
  routineId,
  originalForm,
  initialPendingChangeRequestId = null,
}: UseRoutineFormSubmissionParams) => {
  const router = useRouter();
  const toast = useToast();
  const saveMutation = useCreateRoutineMutation(nickname);
  const updateMutation = useUpdateRoutineMutation(nickname);
  const cancelChangeRequestMutation = useCancelRoutineChangeRequestMutation(
    nickname,
    routineId,
  );
  const pendingChangeRequestId = initialPendingChangeRequestId;

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
          ...buildChangedRoutinePayload(data, originalForm),
          routineId,
        },
        {
          onSuccess: (response) => {
            if (response.mode === 'APPROVAL_REQUESTED') {
              toast.showToast(
                '메이트 승인 요청이 생성되었습니다. 승인 전까지 기존 루틴 정보가 유지됩니다.',
              );
              router.dismissTo('/(tabs)/(afterLogin)/(routine)');
              return;
            }

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
    [originalForm, routineId, router, toast, updateMutation],
  );

  const handleCancelChangeRequest = useCallback(() => {
    if (pendingChangeRequestId === null) {
      return;
    }

    cancelChangeRequestMutation.mutate(pendingChangeRequestId, {
      onSuccess: () => {
        toast.showToast('루틴 수정 요청이 취소되었습니다.');
      },
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : '루틴 수정 요청 취소에 실패했습니다.';

        toast.showToast(message, 'error');
      },
    });
  }, [cancelChangeRequestMutation, pendingChangeRequestId, toast]);

  return {
    handleCreate,
    handleUpdate,
    handleCancelChangeRequest,
    pendingChangeRequestId,
    isPending:
      saveMutation.isPending ||
      updateMutation.isPending ||
      cancelChangeRequestMutation.isPending,
  };
};
