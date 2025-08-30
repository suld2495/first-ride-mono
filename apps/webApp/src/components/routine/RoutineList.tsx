import { Routine } from '@repo/types';

import { ModalName, useModalStore } from '@/store/modal.store';
import { useRoutineStore } from '@/store/routine.store';

import Paragraph from '../common/paragraph/Paragraph';

import {
  RoutineCountList,
  RoutineWeekList,
} from './WeeklyRoutine';

interface RoutineListProps {
  routines: Routine[];
  date: string;
}

const RoutineList = ({ routines, date }: RoutineListProps) => {
  const type = useRoutineStore((state) => state.type);
  const showModal = useModalStore((state) => state.show);
  const setRoutineId = useRoutineStore((state) => state.setRoutineId);

  const handleShowRequestModal = (id: number) => {
    showModal(ModalName.ROUTINE_REQUEST);
    setRoutineId(id);
  };

  const handleShowDetailModal = (id: number) => {
    showModal(ModalName.ROUTINE_DETAIL);
    setRoutineId(id);
  };

  return (
    <div>
      {type === 'number' ? (
        <RoutineCountList
          routines={routines}
          date={date}
          onShowRequestModal={handleShowRequestModal}
          onShowDetailModal={handleShowDetailModal}
        />
      ) : (
        <RoutineWeekList
          routines={routines}
          date={date}
          onShowRequestModal={handleShowRequestModal}
          onShowDetailModal={handleShowDetailModal}
        />
      )}
      {!routines.length && (
        <Paragraph className="py-4 text-center">등록된 루틴이 없습니다.</Paragraph>
      )}
    </div>
  );
};

export default RoutineList;
