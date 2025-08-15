import { createHttp } from '@repo/shared/api';

export const BASE_URL = `${process.env.EXPO_PUBLIC_VITE_BASE_URL}/api`;

createHttp({
  baseURL: BASE_URL,
  request(config) {
    return config;
  },
});
