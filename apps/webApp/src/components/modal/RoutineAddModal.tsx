import { RoutineForm as RoutineFormType } from '@repo/types';

import { useCreateRoutineMutation } from '@repo/shared/hooks/useRoutine';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { useModalStore } from '@/store/modal.store';

import RoutineForm from '../routine/RoutineForm';

const RoutineAddModal = () => {
  const closeModal = useModalStore((state) => state.close);
  const user = useAuthStore((state) => state.user);
  const username = user?.name || ''
  const mateNickname = username === 'yunji' ? 'moon' : 'yunji';

  const saveMutation = useCreateRoutineMutation(username);

  const handleSubmit = async (data: RoutineFormType) => {
    try {
      await saveMutation.mutateAsync(data);
      alert('루틴이 생성되었습니다.');
      closeModal();
    } catch {
      alert('루틴 생성에 실패했습니다.');
    }
  };

  return (
    <RoutineForm
      nickname={username}
      mateNickname={mateNickname}
      onSubmit={handleSubmit}
    />
  );
};

export default RoutineAddModal;
