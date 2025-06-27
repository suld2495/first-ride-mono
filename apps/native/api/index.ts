import axios from 'axios';

export const BASE_URL = `${process.env.EXPO_PUBLIC_VITE_BASE_URL}/api`;

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default http;
