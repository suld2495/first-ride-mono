import { createHttp, UN_AUTHORIZATION_URL } from '@repo/shared/api';

export const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

createHttp({
  baseURL: BASE_URL,
  request(config) {
    if (!UN_AUTHORIZATION_URL.includes(config.url || '')) {
      config.headers.Authorization = `Bearer ${getAuthorization()}`;
    }

    return config;
  },
});

export const setAuthorization = (token: string = '') => {
  localStorage.setItem('token', token);
};

const getAuthorization = () => {
  return localStorage.getItem('token');
};
