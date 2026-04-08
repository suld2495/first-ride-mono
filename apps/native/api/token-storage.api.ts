import * as SecureStore from 'expo-secure-store';

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

export const clearTokens = (): Promise<void[]> => {
  return Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
};
