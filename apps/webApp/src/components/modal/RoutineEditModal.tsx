import { RoutineForm as RoutineFormType } from '@/api/routine.api';
import {
  useRoutineDetailQuery,
  useUpdateRoutineMutation,
} from '@/hooks/useRoutine';
import { useAuthStore } from '@/store/auth.store';
import { useModalStore } from '@/store/modal.store';
import { useRoutineStore } from '@/store/routine.store';

import RoutineForm from '../routine/RoutineForm';

const RoutineEditModal = () => {
  const closeModal = useModalStore((state) => state.close);
  const routineId = useRoutineStore((state) => state.routineId);
  const user = useAuthStore((state) => state.user);
  const { data: detail } = useRoutineDetailQuery(routineId);
  const mateNickname = user === 'yunji' ? 'moon' : 'yunji';

  const updateMutation = useUpdateRoutineMutation(user);

  const handleSubmit = async (data: RoutineFormType) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        routineId,
      });
      alert('루틴이 수정되었습니다.');
      closeModal();
    } catch {
      alert('루틴 수정에 실패했습니다.');
    }
  };

  if (!detail) return null;

  return (
    <RoutineForm
      nickname={user}
      mateNickname={mateNickname}
      form={detail}
      onSubmit={handleSubmit}
    />
  );
};

export default RoutineEditModal;
