import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { User } from '@/types/user';

import { storage } from '.';

export interface UserState {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
  isLoading: boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user: User) => set({ user }),
      signOut: () => set({ user: null }),
      isLoading: true,
    }),
    {
      name: 'user',
      storage,
    },
  ),
);
