import { logout } from '@repo/shared/api/auth.api';
import type { User } from '@repo/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { clearTokens, getRefreshToken } from '@/api/token-storage.api';
import { clearRoutineShareTargets } from '@/share/routine-share';
import { clearRoutineWidgetSnapshot } from '@/widget/routine-widget-native';

import { storage } from './storage-provider.store';

interface State {
  user: User | null;
  lastUserId: string | null;
  isLoading: boolean;
}

interface Actions {
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
  signOutLocally: () => Promise<void>;
}

type AuthStore = State & Actions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        lastUserId: null,
        signIn: (user: User) =>
          set({ user, lastUserId: user.userId, isLoading: false }),
        signOut: async () => {
          try {
            const refreshToken = await getRefreshToken();

            if (refreshToken) {
              await logout({ refreshToken });
            }
          } catch {
            // API 실패 시 무시
          } finally {
            await get().signOutLocally();
          }
        },
        signOutLocally: async () => {
          await clearTokens();
          await clearRoutineWidgetSnapshot();
          await clearRoutineShareTargets();
          set((state) => ({
            user: null,
            lastUserId: state.user?.userId ?? state.lastUserId,
            isLoading: false,
          }));
        },
        isLoading: true,
      }),
      {
        name: 'auth-storage',
        storage,
        partialize: (state) => ({
          user: state.user,
          lastUserId: state.lastUserId,
        }),
      },
    ),
  ),
);

useAuthStore.persist.onHydrate(() => {
  useAuthStore.setState({ isLoading: true });
});

useAuthStore.persist.onFinishHydration(() => {
  useAuthStore.setState({ isLoading: false });
});

if (useAuthStore.persist.hasHydrated()) {
  useAuthStore.setState({ isLoading: false });
}
