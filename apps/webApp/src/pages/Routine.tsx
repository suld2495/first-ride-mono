import { useNavigate, useSearchParams } from 'react-router';

import Button from '@/components/common/button/Button';
import Paragraph from '@/components/common/paragraph/Paragraph';
import RoutineDate from '@/components/routine/RoutineDate';
import RoutineList from '@/components/routine/RoutineList';
import { useRoutinesQuery } from '@/hooks/useRoutine';
import { useAuthStore } from '@/store/auth.store';
import { ModalName, useModalStore } from '@/store/modal.store';
import { getWeekMonday } from '@/utils/date-utils';

const RoutinePage = () => {
  const showModal = useModalStore((state) => state.show);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || getWeekMonday(new Date());
  const user = useAuthStore((state) => state.user);

  const { data: routines, isLoading } = useRoutinesQuery(user, date);

  if (!user) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return null;
  }

  const showRoutineAddModal = () => {
    showModal(ModalName.ROUTINE_ADD);
  };

  return (
    <div className="px-5">
      <div className="mb-5 relative">
        <Paragraph variant="h4">루틴 리스트</Paragraph>
        <Button
          type="button"
          className="absolute right-0 top-[50%] translate-y-[-50%]"
          onClick={showRoutineAddModal}
        >
          루틴 추가
        </Button>
      </div>
      <RoutineDate date={date} />
      <RoutineList routines={routines} date={date} />
    </div>
  );
};

export default RoutinePage;
