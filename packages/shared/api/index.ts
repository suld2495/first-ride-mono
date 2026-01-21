import { ErrorAraryData, ErrorData } from '@repo/types';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import {
  ApiError,
  AppError,
  HttpError,
  NetworkError,
  TimeoutError,
  UnknownError,
} from './AppError';

export const UN_AUTHORIZATION_URL = ['/auth/login', '/auth/join'];

const REQUEST_TIMEOUT_MS = 10_000;

interface TokenManager {
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  saveTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  updateUser: (userInfo: unknown) => void;
}

interface HttpConfig {
  baseURL: string;
  request:
    | ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig)
    | ((
        config: InternalAxiosRequestConfig,
      ) => Promise<InternalAxiosRequestConfig>);
  onUnauthorized?: () => Promise<void>;
  tokenManager?: TokenManager;
}

const UN_AUTHORIZATION_CODE = 401;
const REDIRECT_DEBOUNCE_MS = 1000;
const REQUEST_ID_HEADER = 'X-Request-ID';
let unauthorizedCallback: (() => Promise<void>) | null = null;
let tokenManager: TokenManager | null = null;
let isRedirecting = false;
let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
// 재시도한 요청의 ID를 추적
const retriedRequestIds = new Set<string>();

const axiosInstance = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_TIMEOUT_MS,
});

// 각 요청에 고유 ID 부여
axiosInstance.interceptors.request.use((config) => {
  if (!config.headers[REQUEST_ID_HEADER]) {
    config.headers[REQUEST_ID_HEADER] = `${Date.now()}-${Math.random()}`;
  }
  return config;
});

export const createHttp = (config: HttpConfig) => {
  axiosInstance.defaults.baseURL = config.baseURL;
  axiosInstance.interceptors.request.use(config.request);

  if (config.onUnauthorized) {
    unauthorizedCallback = config.onUnauthorized;
  }

  if (config.tokenManager) {
    tokenManager = config.tokenManager;
  }
};

const onRefreshed = (newAccessToken: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(newAccessToken));
  refreshSubscribers = [];
};

const onRefreshFailed = (error: unknown) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (
  resolve: (token: string) => void,
  reject: (error: unknown) => void,
) => {
  refreshSubscribers.push({ resolve, reject });
};

// 401 에러 발생 시 로그아웃 처리 헬퍼 함수
const handleUnauthorized = async () => {
  if (unauthorizedCallback && !isRedirecting) {
    isRedirecting = true;
    await unauthorizedCallback();
    setTimeout(() => {
      isRedirecting = false;
    }, REDIRECT_DEBOUNCE_MS);
  }
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (error.response?.status === UN_AUTHORIZATION_CODE && originalRequest) {
      // refresh, logout 요청은 제외
      if (
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/logout')
      ) {
        throw error;
      }

      // tokenManager가 없으면 기존 로직 사용
      if (!tokenManager) {
        await handleUnauthorized();
        throw error;
      }

      const requestId = originalRequest.headers[REQUEST_ID_HEADER] as string;

      // 이미 재시도한 요청이면 로그아웃 처리
      if (requestId && retriedRequestIds.has(requestId)) {
        retriedRequestIds.delete(requestId);
        await handleUnauthorized();
        throw error;
      }

      if (isRefreshing) {
        // 이미 갱신 중이면 대기
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(
            (newAccessToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              resolve(axiosInstance(originalRequest));
            },
            (refreshError: unknown) => {
              reject(refreshError);
            },
          );
        });
      }

      if (requestId) {
        retriedRequestIds.add(requestId);
      }
      isRefreshing = true;

      try {
        const storedRefreshToken = await tokenManager.getRefreshToken();

        if (!storedRefreshToken) {
          // refreshToken이 없으면 로그아웃 처리
          isRefreshing = false;
          onRefreshFailed(error);
          await tokenManager.clearTokens();

          if (unauthorizedCallback) {
            await unauthorizedCallback();
          }
          throw error;
        }

        // refreshToken API 호출
        const { refreshToken: refreshTokenFn } = await import('./auth.api');
        const response = await refreshTokenFn({
          refreshToken: storedRefreshToken,
        });

        // 새 토큰 저장
        await tokenManager.saveTokens(
          response.accessToken,
          response.refreshToken,
        );
        tokenManager.updateUser(response.userInfo);

        // 대기 중인 요청들에 새 토큰 전달
        isRefreshing = false;
        onRefreshed(response.accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 -> 대기 중인 요청들에 에러 전달
        isRefreshing = false;
        onRefreshFailed(refreshError);
        if (requestId) {
          retriedRequestIds.delete(requestId);
        }
        await tokenManager.clearTokens();
        await handleUnauthorized();
        throw refreshError;
      }
    }

    throw error;
  },
);

const isErrorArary = (errorData: ErrorData): errorData is ErrorAraryData => {
  return 'errors' in errorData;
};

export const toAppError = (err: unknown): AppError => {
  if (!axios.isAxiosError(err)) {
    return new UnknownError(err);
  }

  const error = err as AxiosError;
  const isTimeout = error.code === 'ECONNABORTED';

  if (isTimeout) {
    return new TimeoutError(error);
  }

  if (!error.response) {
    return new NetworkError(error);
  }

  const url = error.config?.url;
  const { status, data } = error.response;
  const errorData = data as ErrorData;

  if (!errorData) {
    return new HttpError(status, url, error, `HTTP ${status}`);
  }

  if (!isErrorArary(errorData)) {
    const {
      error: { message, data: fieldError },
    } = errorData;

    return new ApiError(fieldError || [], status, url, error, message);
  }

  const { errors } = errorData;

  return new ApiError({ errors }, status, url, error);
};

export const isRetryable = (error: AppError) =>
  error instanceof NetworkError ||
  error instanceof TimeoutError ||
  (error instanceof HttpError && error.status >= 500);

export default axiosInstance;

export * from './AppError';
export { join, login, logout, refreshToken } from './auth.api';
export {
  createRequest,
  fetchReceivedRequests,
  fetchRequestDetail,
  replyRequest,
} from './request.api';
export {
  createRoutine,
  deleteRoutine,
  fetchRoutineDetail,
  fetchRoutines,
  updateRoutine,
} from './routine.api';
export { distributeStats, fetchMyStats } from './stat.api';
