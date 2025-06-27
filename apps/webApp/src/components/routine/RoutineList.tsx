import { Routine } from '@/api/routine.api';
import { ModalName, useModalStore } from '@/store/modal.store';
import { useRoutineStore } from '@/store/routine.store';
import { getDaysOfTheWeek } from '@/utils/date-utils';

import Paragraph from '../common/paragraph/Paragraph';

import {
  RoutineCountList,
  RoutineHeader,
  RoutineWeekList,
} from './RoutineItem';

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
      <ul className="flex w-full text-center text-gray-700 font-bold border-b border-gray-300">
        <li className="text-sm truncate py-2 px-1 w-[100px]">
          <Paragraph>이름</Paragraph>
        </li>
        {type === 'number'
          ? Array.from({ length: 7 }, (_, index) => index + 1).map((index) => (
              <RoutineHeader key={index}>{`${index}회`}</RoutineHeader>
            ))
          : getDaysOfTheWeek().map((day) => (
              <RoutineHeader key={day}>{day}</RoutineHeader>
            ))}

        <RoutineHeader>성공률</RoutineHeader>
        <RoutineHeader>인증</RoutineHeader>
      </ul>
      {!routines.length && (
        <Paragraph className="py-4 text-center">루틴을 추가해보세요.</Paragraph>
      )}
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
    </div>
  );
};

export default RoutineList;
