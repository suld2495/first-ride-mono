import { useRoutineDetailQuery } from '@/hooks/useRoutine';
import { useRoutineStore } from '@/store/routine.store';

import RoutineView from '../routine/RoutineView';

const RoutineDetailModal = () => {
  const routineId = useRoutineStore((state) => state.routineId);
  const { data: detail } = useRoutineDetailQuery(routineId);

  if (!detail) return null;

  return <RoutineView {...detail} />;
};

export default RoutineDetailModal;
