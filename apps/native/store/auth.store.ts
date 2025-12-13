import { logout } from '@repo/shared/api/auth.api';
import { User } from '@repo/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { clearTokens } from '@/api';

import { storage } from './storage-provider';

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
            // 서버에 로그아웃 요청 (API 실패 시에도 로컬 로그아웃 진행)
            await logout();
          } catch (error) {
            console.warn('Logout API failed:', error);
          } finally {
            // 토큰 삭제 및 상태 초기화
            await clearTokens();
            set({ user: null });
          }
        },
        isLoading: true,
      }),
      {
        name: 'auth-storage',
        storage,
      },
    ),
  ),
);
