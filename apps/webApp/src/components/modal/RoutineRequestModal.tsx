import { useRoutineDetailQuery } from '@/hooks/useRoutine';
import { useAuthStore } from '@/store/auth.store';
import { useRoutineStore } from '@/store/routine.store';

import RequestForm from '../request/RequestForm';

const RoutineRequestModal = () => {
  const user = useAuthStore((state) => state.user);
  const routineId = useRoutineStore((state) => state.routineId);
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);

  if (isLoading || !detail) {
    return null;
  }

  return <RequestForm {...detail} nickname={user} />;
};

export default RoutineRequestModal;
