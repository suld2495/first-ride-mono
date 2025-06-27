import { Routine } from '@/api/routine.api';
import { useDeleteRoutineMutation } from '@/hooks/useRoutine';
import { ModalName, useModalStore } from '@/store/modal.store';
import { useRoutineStore } from '@/store/routine.store';
import { getDisplayFormatDate } from '@/utils/date-utils';

import Button from '../common/button/Button';
import Paragraph from '../common/paragraph/Paragraph';

const RoutineView = ({
  routineId,
  nickname,
  routineName,
  routineDetail,
  penalty,
  weeklyCount,
  routineCount,
  startDate,
  endDate,
}: Routine) => {
  const openModal = useModalStore((state) => state.show);
  const closeModal = useModalStore((state) => state.close);
  const setRoutineId = useRoutineStore((state) => state.setRoutineId);

  const deleteRoutine = useDeleteRoutineMutation(nickname);

  const handleDelete = async () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteRoutine.mutateAsync(routineId);
        alert('삭제되었습니다.');
        closeModal();
      } catch {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = () => {
    openModal(ModalName.ROUTINE_EDIT);
    setRoutineId(routineId);
  };

  return (
    <div>
      <div className="py-4">
        <Paragraph className="mb-2" variant="h4">
          {routineName}
        </Paragraph>
        <Paragraph>{routineDetail}</Paragraph>
      </div>
      <div className="py-4">
        <Paragraph className="mb-2" variant="h4">
          루틴 횟수
        </Paragraph>
        <div className="relative w-full">
          <Paragraph>
            {weeklyCount}/{routineCount}
          </Paragraph>
        </div>
      </div>
      <div className="py-4">
        <Paragraph className="mb-2" variant="h4">
          벌금
        </Paragraph>
        <div className="relative w-full">
          <Paragraph>{penalty.toLocaleString()}원</Paragraph>
        </div>
      </div>
      <div className="py-4">
        <Paragraph className="mb-2" variant="h4">
          루틴 날짜
        </Paragraph>
        <div className="relative w-full">
          <Paragraph>
            {getDisplayFormatDate(new Date(startDate))} ~
            {endDate && <span> {getDisplayFormatDate(new Date(endDate))}</span>}
          </Paragraph>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <Button
          className="mr-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={closeModal}
        >
          확인
        </Button>
        <Button
          className="mr-2 bg-sky-400 hover:bg-sky-500 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={handleEdit}
        >
          수정
        </Button>
        <Button
          className="mr-2 px-4 bg-red-400 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={handleDelete}
        >
          삭제
        </Button>
      </div>
    </div>
  );
};

export default RoutineView;
