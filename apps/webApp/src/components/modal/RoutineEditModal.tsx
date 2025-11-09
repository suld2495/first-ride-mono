import {
  useRoutineDetailQuery,
  useUpdateRoutineMutation,
} from '@repo/shared/hooks/useRoutine';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { RoutineForm as RoutineFormType } from '@repo/types';

import { useToast } from '@/hooks/useToast';
import { useModalStore } from '@/store/modal.store';
import { useRoutineStore } from '@/store/routine.store';
import { getApiErrorMessage } from '@/utils/error-utils';

import ToastContainer from '../common/ToastContainer';
import RoutineForm from '../routine/RoutineForm';

const RoutineEditModal = () => {
  const closeModal = useModalStore((state) => state.close);
  const routineId = useRoutineStore((state) => state.routineId);
  const user = useAuthStore((state) => state.user);
  const username = user?.nickname || '';
  const { data: detail } = useRoutineDetailQuery(routineId);
  const mateNickname = username === 'yunji' ? 'moon' : 'yunji';
  const { toasts, success, error, removeToast } = useToast();

  const updateMutation = useUpdateRoutineMutation(username);

  const handleSubmit = async (data: RoutineFormType) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        routineId,
      });
      success('루틴이 수정되었습니다.');
      closeModal();
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '루틴 수정에 실패했습니다. 다시 시도해주세요.',
      );

      error(errorMessage);
    }
  };

  if (!detail) return null;

  return (
    <>
      <RoutineForm
        nickname={username}
        mateNickname={mateNickname}
        form={detail}
        onSubmit={handleSubmit}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default RoutineEditModal;
