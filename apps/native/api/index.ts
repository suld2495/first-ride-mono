import { createHttp, UN_AUTHORIZATION_URL } from '@repo/shared/api';
import { REQUEST_TIMEOUT_MS } from '@repo/shared/api/auth.api';
import type { User } from '@repo/types';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { useAuthStore } from '@/store/auth.store';

export const BASE_URL = `${process.env.EXPO_PUBLIC_VITE_BASE_URL || ''}/api`;

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const setAuthorization = (token: string): Promise<void> => {
  return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

export const getAuthorization = (): Promise<string | null> => {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (token: string): Promise<void> => {
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = (): Promise<string | null> => {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const clearTokens = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
};

createHttp({
  baseURL: BASE_URL,
  async request(config) {
    if (!UN_AUTHORIZATION_URL.includes(config.url || '')) {
      const token = await getAuthorization();

      config.headers.Authorization = `Bearer ${token}`;
    }

    config.timeout = REQUEST_TIMEOUT_MS;
    return config;
  },
  async onUnauthorized() {
    await useAuthStore.getState().signOut();
    router.replace('/sign-in');
  },
  tokenManager: {
    getAccessToken: getAuthorization,
    getRefreshToken,
    saveTokens: async (accessToken: string, refreshToken: string) => {
      await Promise.all([
        setAuthorization(accessToken),
        setRefreshToken(refreshToken),
      ]);
    },
    clearTokens,
    updateUser: (userInfo: unknown) => {
      useAuthStore.getState().signIn(userInfo as User);
    },
  },
});
