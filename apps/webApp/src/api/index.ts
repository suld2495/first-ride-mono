import { createHttp } from "@repo/shared/api";

export const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

createHttp({
  baseURL: BASE_URL,
  request(config) {
    if (!['/login', '/join'].includes(config.url || '')) {
      config.headers.Authorization = getAuthorization();
    }

    return config;
  }
});

export const setAuthorization = (token: string = '') => {
  localStorage.setItem('token', token);
};

const getAuthorization = () => {
  return localStorage.getItem('token');
}