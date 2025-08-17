import { createHttp } from '@repo/shared/api';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = `${process.env.EXPO_PUBLIC_VITE_BASE_URL}/api`;

createHttp({
  baseURL: BASE_URL,
  request(config) {
    return config;
  },
});

export const setAuthorization = (token: string) => {
  SecureStore.setItem('token', token);
};

export const getAuthorization = () => {
  return SecureStore.getItem('token');
};
