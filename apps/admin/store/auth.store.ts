import { logout } from '@repo/shared/api/auth.api';
import { User } from '@repo/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { clearTokens } from '@/lib/api';

interface State {
  user: User | null;
  isLoading: boolean;
}

interface Actions {
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<State & Actions>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        signIn: (user: User) => set({ user }),
        signOut: async () => {
          try {
            await logout();
          } catch {
            // Ignore API errors
          } finally {
            clearTokens();
            set({ user: null });
          }
        },
        isLoading: true,
      }),
      {
        name: 'auth-storage',
      },
    ),
  ),
);
