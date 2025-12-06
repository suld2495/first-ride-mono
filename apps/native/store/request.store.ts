import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  requestId: number;
}

interface Action {
  setRequestId: (id: number) => void;
}

const initialState: State = {
  requestId: 0,
};

export const useRequestStore = create<State & Action>()(
  devtools((set) => ({
    ...initialState,

    setRequestId: (id: number) => set({ requestId: id }),
  })),
);
