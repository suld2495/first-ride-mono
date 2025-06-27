import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  routineId: number;
  type: 'number' | 'week';
}

interface Action {
  setRoutineId: (id: number) => void;
  setType: (type: 'number' | 'week') => void;
}

const initialState: State = {
  routineId: 0,
  type: 'number',
};

export const useRoutineStore = create<State & Action>()(
  devtools((set) => ({
    ...initialState,

    setRoutineId: (id: number) => set({ routineId: id }),
    setType: (type: 'number' | 'week') => set({ type }),
  })),
);
