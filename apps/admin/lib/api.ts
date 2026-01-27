import { createHttp, UN_AUTHORIZATION_URL } from '@repo/shared/api';
import { REQUEST_TIMEOUT_MS } from '@repo/shared/api/auth.api';
import type { User } from '@repo/types';
import { redirect } from 'next/navigation';

import { useAuthStore } from '@/store/auth.store';

export const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api`;

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const setAuthorization = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAuthorization = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

createHttp({
  baseURL: BASE_URL,
  request(config) {
    if (!UN_AUTHORIZATION_URL.includes(config.url || '')) {
      const token = getAuthorization();

      config.headers.Authorization = `Bearer ${token}`;
    }

    config.timeout = REQUEST_TIMEOUT_MS;
    return config;
  },
  onUnauthorized() {
    useAuthStore.getState().signOut();
    redirect('/login');
  },
  tokenManager: {
    getAccessToken: () => Promise.resolve(getAuthorization()),
    getRefreshToken: () => Promise.resolve(getRefreshToken()),
    saveTokens: async (accessToken: string, refreshToken: string) => {
      setAuthorization(accessToken);
      setRefreshToken(refreshToken);
    },
    clearTokens: async () => {
      clearTokens();
    },
    updateUser: (userInfo: unknown) => {
      useAuthStore.getState().signIn(userInfo as User);
    },
  },
});
