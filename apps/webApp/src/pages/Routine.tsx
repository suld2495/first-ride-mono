import { useNavigate, useSearchParams } from 'react-router';
import { useRoutinesQuery } from '@repo/shared/hooks/useRoutine';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { getWeekMonday } from '@repo/shared/utils';

import RoutineHeader from '@/components/routine/RoutineHeader';
import RoutineList from '@/components/routine/RoutineList';

const RoutinePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || getWeekMonday(new Date());
  const user = useAuthStore((state) => state.user);

  const { data: routines, isLoading } = useRoutinesQuery(
    user?.nickname || '',
    date,
  );

  if (!user) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <div>
      <RoutineHeader date={date} />
      <RoutineList routines={routines} date={date} />
    </div>
  );
};

export default RoutinePage;
