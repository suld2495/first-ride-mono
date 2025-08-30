import { createHttp, UN_AUTHORIZATION_URL } from '@repo/shared/api';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = `${process.env.EXPO_PUBLIC_VITE_BASE_URL || ''}/api`;

createHttp({
  baseURL: BASE_URL,
  request(config) {
    if (!UN_AUTHORIZATION_URL.includes(config.url || '')) {
      config.headers.Authorization = `Bearer ${getAuthorization()}`;
    }

    return config;
  },
});

export const setAuthorization = (token: string) => {
  SecureStore.setItem('token', token);
};

export const getAuthorization = () => {
  return SecureStore.getItem('token');
};
