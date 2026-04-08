import { useRoutineStore } from '@/store/routine.store';

export const useSelectedRoutineId = () =>
  useRoutineStore((state) => state.routineId);

export const useRoutineId = useSelectedRoutineId;

export const useRoutineViewType = () => useRoutineStore((state) => state.type);

export const useRoutineType = useRoutineViewType;

export const useSelectRoutine = () =>
  useRoutineStore((state) => state.setRoutineId);

export const useSetRoutineId = useSelectRoutine;

export const useSetRoutineViewType = () =>
  useRoutineStore((state) => state.setType);

export const useSetRoutineType = useSetRoutineViewType;

export const useRoutineForm = () =>
  useRoutineStore((state) => state.routineForm);

export const useSetRoutineForm = () =>
  useRoutineStore((state) => state.setRoutineForm);
