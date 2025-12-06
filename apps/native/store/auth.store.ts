import { User } from '@repo/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { storage } from './storage-provider';

interface State {
  user: User | null;
  isLoading: boolean;
}

interface Actions {
  signIn: (user: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        signIn: (user: User) => set({ user }),
        signOut: () => set({ user: null }),
        isLoading: true,
      }),
      {
        name: 'auth-storage',
        storage,
      },
    ),
  ),
);
