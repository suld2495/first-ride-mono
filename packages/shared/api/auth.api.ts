import {
  AuthForm,
  AuthResponse,
  JoinForm,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@repo/types';
import axios from 'axios';

import http from './client';
import axiosInstance, { toAppError } from '.';

const baseURL = '/auth';
const REQUEST_TIMEOUT_MS = 10_000;

// 순환 참조 방지를 위한 별도 axios 인스턴스 (인터셉터 없이)
const refreshAxios = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_TIMEOUT_MS,
});

export const login = async (form: AuthForm): Promise<AuthResponse> => {
  try {
    const response: AuthResponse = await http.post(`${baseURL}/login`, form);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const join = async (form: JoinForm): Promise<void> => {
  try {
    const response: void = await http.post(`${baseURL}/signup`, form);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

export const refreshToken = async (
  request: RefreshTokenRequest,
): Promise<RefreshTokenResponse> => {
  try {
    const dynamicBaseURL = axiosInstance.defaults.baseURL || '';
    const response = await refreshAxios.post<{
      data: RefreshTokenResponse;
    }>(`${dynamicBaseURL}${baseURL}/refresh`, request);

    return response.data.data;
  } catch (error) {
    throw toAppError(error);
  }
};

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response: LogoutResponse = await http.post(`${baseURL}/logout`);

    return response;
  } catch (error) {
    // 로그아웃 API 실패 시에도 로컬 로그아웃은 진행
    console.warn('Logout API failed, but proceeding with local logout:', error);
    return { message: 'Logged out locally' };
  }
};
