import { createHttp, UN_AUTHORIZATION_URL } from '@repo/shared/api';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { useAuthStore } from '@/store/auth.store';

export const BASE_URL = `${process.env.EXPO_PUBLIC_VITE_BASE_URL || ''}/api`;

createHttp({
  baseURL: BASE_URL,
  request(config) {
    if (!UN_AUTHORIZATION_URL.includes(config.url || '')) {
      config.headers.Authorization = `Bearer ${getAuthorization()}`;
    }

    return config;
  },
  async onUnauthorized() {
    useAuthStore.getState().signOut();
    try {
      await SecureStore.deleteItemAsync('token');
    } catch (error) {
      console.error('Failed to delete token:', error);
    }
    router.replace('/sign-in');
  },
});

export const setAuthorization = (token: string) => {
  SecureStore.setItem('token', token);
};

export const getAuthorization = () => {
  return SecureStore.getItem('token');
};
