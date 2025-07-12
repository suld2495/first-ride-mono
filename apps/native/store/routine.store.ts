import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { RoutineForm } from '@repo/types';

interface State {
  routineId: number;
  routineForm: RoutineForm;
}

interface Action {
  setRoutineId: (id: number) => void;
  setRoutineForm: (routineForm: RoutineForm) => void;
  resetRoutineForm: () => void;
}

const initialState: State = {
  routineId: 0,
  routineForm: {
    nickname: '',
    routineName: '',
    startDate: '',
    endDate: '',
    routineDetail: '',
    penalty: 0,
    routineCount: 0,
    mateNickname: '',
  },
};

export const useRoutineStore = create<State & Action>()(
  devtools((set) => ({
    ...initialState,

    setRoutineId: (id: number) => set({ routineId: id }),
    setRoutineForm: (form: RoutineForm) => set({ routineForm: form }),
    resetRoutineForm: () =>
      set({ routineForm: { ...initialState.routineForm } }),
  })),
);
