import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { useAuthStore } from '@repo/shared/store/auth.store';

import { useRoutineStore } from '@/store/routine.store';

import RequestForm from '../request/RequestForm';

const RoutineRequestModal = () => {
  const user = useAuthStore((state) => state.user);
  const username = user?.nickname || '';
  const routineId = useRoutineStore((state) => state.routineId);
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);

  if (isLoading || !detail) {
    return null;
  }

  return <RequestForm {...detail} nickname={username} />;
};

export default RoutineRequestModal;
