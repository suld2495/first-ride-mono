import type { RoutineForm } from '@repo/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { DEFAULT_ROUTINE_COLOR } from '@/constants/ROUTINE_COLORS';

interface State {
  routineId: number;
  routineForm: RoutineForm;
  routineDateSelection: {
    initialStartDate: string | null;
    initialEndDate: string | null;
    confirmedStartDate: string | null;
    confirmedEndDate: string | null;
  } | null;
  type: 'number' | 'week';
}

interface Action {
  setRoutineId: (id: number) => void;
  setRoutineForm: (routineForm: RoutineForm) => void;
  resetRoutineForm: () => void;
  beginRoutineDateSelection: (
    initialStartDate: string | null,
    initialEndDate: string | null,
  ) => void;
  confirmRoutineDateSelection: (
    confirmedStartDate: string,
    confirmedEndDate: string | null,
  ) => void;
  clearRoutineDateSelection: () => void;
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
    symbolColor: DEFAULT_ROUTINE_COLOR,
    mateNickname: '',
    isMe: true,
  },
  routineDateSelection: null,
  type: 'week',
};

export const useRoutineStore = create<State & Action>()(
  devtools((set) => ({
    ...initialState,

    setRoutineId: (id: number) => set({ routineId: id }),
    setRoutineForm: (form: RoutineForm) => set({ routineForm: form }),
    resetRoutineForm: () =>
      set({
        routineForm: { ...initialState.routineForm },
        routineDateSelection: null,
      }),
    beginRoutineDateSelection: (initialStartDate, initialEndDate) =>
      set({
        routineDateSelection: {
          initialStartDate,
          initialEndDate,
          confirmedStartDate: null,
          confirmedEndDate: null,
        },
      }),
    confirmRoutineDateSelection: (confirmedStartDate, confirmedEndDate) =>
      set((state) => ({
        routineDateSelection: {
          initialStartDate:
            state.routineDateSelection?.initialStartDate ?? confirmedStartDate,
          initialEndDate:
            state.routineDateSelection?.initialEndDate ?? confirmedEndDate,
          confirmedStartDate,
          confirmedEndDate,
        },
      })),
    clearRoutineDateSelection: () => set({ routineDateSelection: null }),
    setType: (type: 'number' | 'week') => set({ type }),
  })),
);
