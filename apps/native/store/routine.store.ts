import { RoutineForm } from '@repo/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  routineId: number;
  routineForm: RoutineForm;
  type: 'number' | 'week';
}

interface Action {
  setRoutineId: (id: number) => void;
  setRoutineForm: (routineForm: RoutineForm) => void;
  resetRoutineForm: () => void;
  setType: (type: 'number' | 'week') => void;
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
    isMe: false,
  },
  type: 'number',
};

export const useRoutineStore = create<State & Action>()(
  devtools((set) => ({
    ...initialState,

    setRoutineId: (id: number) => set({ routineId: id }),
    setRoutineForm: (form: RoutineForm) => set({ routineForm: form }),
    resetRoutineForm: () =>
      set({ routineForm: { ...initialState.routineForm } }),
    setType: (type: 'number' | 'week') => set({ type }),
  })),
);
