import { useCreateRoutineMutation } from '@repo/shared/hooks/useRoutine';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { RoutineForm as RoutineFormType } from '@repo/types';

import { useToast } from '@/hooks/useToast';
import { useModalStore } from '@/store/modal.store';
import { getApiErrorMessage } from '@/utils/error-utils';

import ToastContainer from '../common/ToastContainer';
import RoutineForm from '../routine/RoutineForm';

const RoutineAddModal = () => {
  const closeModal = useModalStore((state) => state.close);
  const user = useAuthStore((state) => state.user);
  const username = user?.nickname || '';
  const { toasts, success, error, removeToast } = useToast();

  const saveMutation = useCreateRoutineMutation(username);

  const handleSubmit = async (data: RoutineFormType) => {
    try {
      await saveMutation.mutateAsync(data);
      success('루틴이 생성되었습니다.');
      closeModal();
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '루틴 생성에 실패했습니다. 다시 시도해주세요.',
      );

      error(errorMessage);
    }
  };

  return (
    <>
      <RoutineForm nickname={username} onSubmit={handleSubmit} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default RoutineAddModal;
