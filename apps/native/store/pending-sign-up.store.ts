import type { JoinForm } from '@repo/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  payload: JoinForm | null;
}

interface Action {
  setPayload: (payload: JoinForm) => void;
  clearPayload: () => void;
}

export const usePendingSignUpStore = create<State & Action>()(
  devtools((set) => ({
    payload: null,
    setPayload: (payload) => set({ payload }),
    clearPayload: () => set({ payload: null }),
  })),
);
