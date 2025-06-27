import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface State {
  user: string;
}

interface Actions {
  setUser: (nickname: string) => void;
}

export const useAuthStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        user: '',
        setUser: (user: string) => set({ user }),
      }),
      {
        name: 'auth-storage', // unique name for local storage key
      },
    ),
  ),
);
