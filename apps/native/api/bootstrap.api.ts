import { createHttp, UN_AUTHORIZATION_URL } from '@repo/shared/api';
import { ApiError } from '@repo/shared/api/AppError';
import { REQUEST_TIMEOUT_MS } from '@repo/shared/api/auth.api';
import type { User } from '@repo/types';
import { router } from 'expo-router';

import {
  BASE_URL,
  clearTokens,
  getAuthorization,
  getRefreshToken,
  setAuthorization,
  setRefreshToken,
} from '@/api/token-storage.api';
import { useAuthStore } from '@/store/auth.store';

const INTERNAL_SERVER_ERROR_STATUS = 500;

createHttp({
  baseURL: BASE_URL,
  async request(config) {
    try {
      if (!UN_AUTHORIZATION_URL.includes(config.url || '')) {
        const token = await getAuthorization();

        config.headers.Authorization = `Bearer ${token}`;
      }

      config.timeout = REQUEST_TIMEOUT_MS;
      return config;
    } catch (error) {
      throw new ApiError(
        [],
        INTERNAL_SERVER_ERROR_STATUS,
        config.url || '',
        error,
        '요청 설정에 실패했습니다.',
      );
    }
  },
  async onUnauthorized() {
    try {
      await useAuthStore.getState().signOut();
      router.replace('/sign-in');
    } catch (error) {
      throw new ApiError(
        [],
        INTERNAL_SERVER_ERROR_STATUS,
        '/auth/logout',
        error,
        '로그아웃 처리에 실패했습니다.',
      );
    }
  },
  tokenManager: {
    getAccessToken: getAuthorization,
    getRefreshToken,
    saveTokens: async (accessToken: string, refreshToken: string) => {
      try {
        await Promise.all([
          setAuthorization(accessToken),
          setRefreshToken(refreshToken),
        ]);
      } catch (error) {
        throw new ApiError(
          [],
          INTERNAL_SERVER_ERROR_STATUS,
          '/auth/tokens',
          error,
          '토큰 저장에 실패했습니다.',
        );
      }
    },
    clearTokens: async () => {
      try {
        await clearTokens();
      } catch (error) {
        throw new ApiError(
          [],
          INTERNAL_SERVER_ERROR_STATUS,
          '/auth/tokens',
          error,
          '토큰 삭제에 실패했습니다.',
        );
      }
    },
    updateUser: (userInfo: unknown) => {
      useAuthStore.getState().signIn(userInfo as User);
    },
  },
});
