import { logout } from '@repo/shared/api/auth.api';
import type { User } from '@repo/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { clearTokens } from '@/api/token-storage.api';

import { storage } from './storage-provider.store';

interface State {
  user: User | null;
  isLoading: boolean;
}

interface Actions {
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
}

type AuthStore = State & Actions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        signIn: (user: User) => set({ user, isLoading: false }),
        signOut: async () => {
          try {
            // 서버에 로그아웃 요청 (API 실패 시에도 로컬 로그아웃 진행)
            await logout();
          } catch {
            // API 실패 시 무시
          } finally {
            // 토큰 삭제 및 상태 초기화
            await clearTokens();
            set({ user: null, isLoading: false });
          }
        },
        isLoading: true,
      }),
      {
        name: 'auth-storage',
        storage,
        partialize: (state) => ({
          user: state.user,
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
