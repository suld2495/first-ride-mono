import { useRoutineStore } from '@/store/routine.store';

export const useRoutineFormState = () =>
  useRoutineStore((state) => state.routineForm);

export const useSetRoutineFormState = () =>
  useRoutineStore((state) => state.setRoutineForm);

export const useResetRoutineFormState = () =>
  useRoutineStore((state) => state.resetRoutineForm);
