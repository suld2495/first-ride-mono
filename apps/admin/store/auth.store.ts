import { logout } from '@repo/shared/api/auth.api';
import type { User } from '@repo/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { clearTokens, getRefreshToken } from '@/lib/api';

interface State {
  user: User | null;
  isLoading: boolean;
}

interface Actions {
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  signOutLocally: () => Promise<void>;
}

export const useAuthStore = create<State & Actions>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        signIn: (user: User) => set({ user }),
        signOut: async () => {
          try {
            const refreshToken = getRefreshToken();

            if (refreshToken) {
              await logout({ refreshToken });
            }
          } catch {
            // Ignore API errors
          } finally {
            await get().signOutLocally();
          }
        },
        signOutLocally: async () => {
          clearTokens();
          set({ user: null });
        },
        isLoading: true,
      }),
      {
        name: 'auth-storage',
      },
    ),
  ),
);
