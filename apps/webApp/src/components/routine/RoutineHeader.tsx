import { ModalName, useModalStore } from '@/store/modal.store';

import Button from '../common/button/Button';
import Paragraph from '../common/paragraph/Paragraph';

import RoutineDate from './RoutineDate';

interface RoutineHeaderProps {
  date: string;
}

const RoutineHeader = ({ date }: RoutineHeaderProps) => {
  const showModal = useModalStore((state) => state.show);

  const showRoutineAddModal = () => {
    showModal(ModalName.ROUTINE_ADD);
  };

  return (
    <>
      <div className="mb-5 relative">
        <Paragraph size="xl" weight="semibold">루틴 리스트</Paragraph>
        <Button
          type="button"
          className="absolute right-0 top-[50%] translate-y-[-50%]"
          onClick={showRoutineAddModal}
        >
          루틴 추가
        </Button>
      </div>
      <RoutineDate date={date} />
    </>
  );
};

export default RoutineHeader;
