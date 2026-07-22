import type {
  AuthForm,
  AuthResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  EmailCheckResponse,
  EmailVerificationRequestResponse,
  EmailVerificationStatusResponse,
  JoinForm,
  JobOption,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@repo/types';
import axios from 'axios';

import axiosInstance, { toAppError } from '.';
import http from './client';

const baseURL = '/auth';

export const REQUEST_TIMEOUT_MS = 10_000;

// 순환 참조 방지를 위한 별도 axios 인스턴스 (인터셉터 없이)
const refreshAxios = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_TIMEOUT_MS,
});

type RawTokenResponse = Omit<RefreshTokenResponse, 'userInfo'> & {
  user?: RefreshTokenResponse['userInfo'];
  userInfo?: RefreshTokenResponse['userInfo'];
};

export const normalizeTokenResponse = (
  response: RawTokenResponse,
): RefreshTokenResponse => {
  const userInfo = response.userInfo ?? response.user;

  if (!userInfo) {
    throw new Error('토큰 응답에 사용자 정보가 없습니다.');
  }

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    userInfo,
  };
};

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

export const checkEmailAvailability = async (
  email: string,
): Promise<EmailCheckResponse> => {
  try {
    return await http.get<EmailCheckResponse, Record<string, string>>(
      `${baseURL}/email/check`,
      {
        params: { email },
      },
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const requestEmailVerification = async (
  email: string,
): Promise<EmailVerificationRequestResponse> => {
  try {
    return await http.post<EmailVerificationRequestResponse, { email: string }>(
      `${baseURL}/email/verification-requests`,
      { email },
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const confirmEmailVerification = async (
  email: string,
): Promise<EmailVerificationStatusResponse> => {
  try {
    return await http.post<EmailVerificationStatusResponse, { email: string }>(
      `${baseURL}/email/verification-confirm`,
      { email },
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const fetchJobOptions = async (): Promise<JobOption[]> => {
  try {
    return await http.get(`${baseURL}/job-options`);
  } catch (error) {
    throw toAppError(error);
  }
};

export const refreshToken = async (
  request: RefreshTokenRequest,
): Promise<RefreshTokenResponse> => {
  try {
    const dynamicBaseURL = axiosInstance.defaults.baseURL ?? '';
    const response = await refreshAxios.post<{
      data: RawTokenResponse;
    }>(`${dynamicBaseURL}${baseURL}/refresh`, request);

    return normalizeTokenResponse(response.data.data);
  } catch (error) {
    throw toAppError(error);
  }
};

export const logout = async (
  request: LogoutRequest,
): Promise<LogoutResponse> => {
  try {
    const response: LogoutResponse = await http.post(
      `${baseURL}/logout`,
      request,
    );

    return response;
  } catch {
    // 로그아웃 API 실패 시에도 로컬 로그아웃은 진행
    return { message: 'Logged out locally' };
  }
};

export const deleteAccount = async (
  request?: DeleteAccountRequest,
): Promise<DeleteAccountResponse> => {
  try {
    return await http.delete<DeleteAccountResponse, DeleteAccountRequest>(
      `${baseURL}/me`,
      request ? { data: request } : undefined,
    );
  } catch (error) {
    throw toAppError(error);
  }
};
