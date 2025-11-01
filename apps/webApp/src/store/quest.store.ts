import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  questId: number;
}

interface Action {
  setQuestId: (id: number) => void;
}

const initialState: State = {
  questId: 0,
};

export const useQuestStore = create<State & Action>()(
  devtools((set) => ({
    ...initialState,

    setQuestId: (id: number) => set({ questId: id }),
  })),
);
