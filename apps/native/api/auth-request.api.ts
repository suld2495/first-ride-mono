import type { InternalAxiosRequestConfig } from 'axios';

export const applyAccessToken = (
  config: InternalAxiosRequestConfig,
  accessToken: string | null,
): InternalAxiosRequestConfig => {
  const normalizedAccessToken = accessToken?.trim();

  if (normalizedAccessToken) {
    config.headers.Authorization = `Bearer ${normalizedAccessToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
};
