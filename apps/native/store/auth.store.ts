import { logout } from '@repo/shared/api/auth.api';
import type { User } from '@repo/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { deletePushToken } from '@/api/push-token.api';
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
  signOut: (pushToken?: string) => Promise<void>;
  signOutLocally: () => Promise<void>;
}

type AuthStore = State & Actions;

type CleanupTask = () => Promise<unknown>;

const settleCleanupTasks = async (tasks: CleanupTask[]): Promise<void> => {
  await Promise.allSettled(
    tasks.map((task) => Promise.resolve().then(() => task())),
  );
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        lastUserId: null,
        signIn: (user: User) =>
          set({ user, lastUserId: user.userId, isLoading: false }),
        signOut: async (pushToken) => {
          const remoteCleanupTasks: CleanupTask[] = [];

          if (pushToken) {
            remoteCleanupTasks.push(() => deletePushToken(pushToken));
          }

          try {
            const refreshToken = await getRefreshToken();

            if (refreshToken) {
              remoteCleanupTasks.push(() => logout({ refreshToken }));
            }
          } catch {
            // 저장소 조회 실패와 관계없이 다른 정리 작업을 계속한다.
          } finally {
            await settleCleanupTasks(remoteCleanupTasks);
            await get().signOutLocally();
          }
        },
        signOutLocally: async () => {
          set((state) => ({
            user: null,
            lastUserId: state.user?.userId ?? state.lastUserId,
            isLoading: false,
          }));

          await settleCleanupTasks([
            clearTokens,
            clearRoutineWidgetSnapshot,
            clearRoutineShareTargets,
          ]);
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
