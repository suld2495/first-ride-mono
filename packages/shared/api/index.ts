import type { ErrorAraryData, ErrorData } from '@repo/types';
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios, { AxiosHeaders } from 'axios';

import type { AppError } from './AppError';
import {
  ApiError,
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
const AUTHORIZATION_HEADER = 'Authorization';
const INTERNAL_SERVER_ERROR_STATUS = 500;
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

const getHeaders = (config: InternalAxiosRequestConfig): AxiosHeaders => {
  return AxiosHeaders.from(config.headers);
};

const getHeaderValue = (
  config: InternalAxiosRequestConfig,
  headerName: string,
): string | undefined => {
  const headerValue = getHeaders(config).get(headerName);

  return typeof headerValue === 'string' ? headerValue : undefined;
};

const setHeaderValue = (
  config: InternalAxiosRequestConfig,
  headerName: string,
  headerValue: string,
): void => {
  const headers = getHeaders(config);

  headers.set(headerName, headerValue);
  config.headers = headers;
};

const createRequestId = (): string => {
  return `${Date.now()}-${Math.random()}`;
};

// 각 요청에 고유 ID 부여
axiosInstance.interceptors.request.use((config): InternalAxiosRequestConfig => {
  if (!getHeaderValue(config, REQUEST_ID_HEADER)) {
    setHeaderValue(config, REQUEST_ID_HEADER, createRequestId());
  }

  return config;
});

export const createHttp = (config: HttpConfig): void => {
  const {
    baseURL,
    onUnauthorized,
    request,
    tokenManager: nextTokenManager,
  } = config;

  axiosInstance.defaults.baseURL = baseURL;
  axiosInstance.interceptors.request.use(request);

  if (onUnauthorized) {
    unauthorizedCallback = onUnauthorized;
  }

  if (nextTokenManager) {
    tokenManager = nextTokenManager;
  }
};

const onRefreshed = (newAccessToken: string): void => {
  refreshSubscribers.forEach(({ resolve }) => resolve(newAccessToken));
  refreshSubscribers = [];
};

const onRefreshFailed = (error: unknown): void => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (
  resolve: (token: string) => void,
  reject: (error: unknown) => void,
): void => {
  refreshSubscribers.push({ resolve, reject });
};

// 401 에러 발생 시 로그아웃 처리 헬퍼 함수
const handleUnauthorized = async (): Promise<void> => {
  if (unauthorizedCallback && !isRedirecting) {
    isRedirecting = true;
    await unauthorizedCallback();
    setTimeout(() => {
      isRedirecting = false;
    }, REDIRECT_DEBOUNCE_MS);
  }
};

const shouldSkipTokenRefresh = (
  originalRequest: InternalAxiosRequestConfig,
): boolean => {
  return (
    originalRequest.url?.includes('/auth/refresh') === true ||
    originalRequest.url?.includes('/auth/logout') === true
  );
};

const retryWithRefreshedToken = async (
  originalRequest: InternalAxiosRequestConfig,
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    addRefreshSubscriber(
      (newAccessToken: string) => {
        setHeaderValue(
          originalRequest,
          AUTHORIZATION_HEADER,
          `Bearer ${newAccessToken}`,
        );
        resolve(axiosInstance(originalRequest));
      },
      (refreshError: unknown) => {
        reject(refreshError);
      },
    );
  });
};

const handleMissingRefreshToken = async (
  error: AxiosError,
  activeTokenManager: TokenManager,
): Promise<never> => {
  isRefreshing = false;
  onRefreshFailed(error);
  await activeTokenManager.clearTokens();

  if (unauthorizedCallback) {
    await unauthorizedCallback();
  }

  throw error;
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status !== UN_AUTHORIZATION_CODE || !originalRequest) {
      throw error;
    }

    if (shouldSkipTokenRefresh(originalRequest)) {
      throw error;
    }

    if (!tokenManager) {
      await handleUnauthorized();
      throw error;
    }

    const requestId = getHeaderValue(originalRequest, REQUEST_ID_HEADER);

    if (requestId && retriedRequestIds.has(requestId)) {
      retriedRequestIds.delete(requestId);
      await handleUnauthorized();
      throw error;
    }

    if (isRefreshing) {
      return retryWithRefreshedToken(originalRequest);
    }

    if (requestId) {
      retriedRequestIds.add(requestId);
    }

    isRefreshing = true;

    try {
      const activeTokenManager = tokenManager;

      const storedRefreshToken = await activeTokenManager.getRefreshToken();

      if (!storedRefreshToken) {
        return handleMissingRefreshToken(error, activeTokenManager);
      }

      const { refreshToken: refreshTokenFn } = await import('./auth.api');
      const response = await refreshTokenFn({
        refreshToken: storedRefreshToken,
      });

      await activeTokenManager.saveTokens(
        response.accessToken,
        response.refreshToken,
      );
      activeTokenManager.updateUser(response.userInfo);

      isRefreshing = false;
      onRefreshed(response.accessToken);

      setHeaderValue(
        originalRequest,
        AUTHORIZATION_HEADER,
        `Bearer ${response.accessToken}`,
      );

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      onRefreshFailed(refreshError);
      if (requestId) {
        retriedRequestIds.delete(requestId);
      }
      await tokenManager.clearTokens();
      await handleUnauthorized();
      throw refreshError;
    }
  },
);

const isErrorArary = (errorData: ErrorData): errorData is ErrorAraryData => {
  return 'errors' in errorData;
};

export const toAppError = (err: unknown): AppError => {
  if (err instanceof Error && 'name' in err && err.name.endsWith('Error')) {
    if (
      err instanceof ApiError ||
      err instanceof HttpError ||
      err instanceof NetworkError ||
      err instanceof TimeoutError ||
      err instanceof UnknownError
    ) {
      return err;
    }
  }

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
  const errorData = data as ErrorData | undefined;

  if (!errorData) {
    return new HttpError(status, url, error, `HTTP ${status}`);
  }

  if (!isErrorArary(errorData)) {
    const {
      error: { message, data: fieldError },
    } = errorData;

    return new ApiError(fieldError ?? [], status, url, error, message);
  }

  const { errors } = errorData;

  return new ApiError({ errors }, status, url, error);
};

export const isRetryable = (error: AppError): boolean =>
  error instanceof NetworkError ||
  error instanceof TimeoutError ||
  (error instanceof HttpError && error.status >= INTERNAL_SERVER_ERROR_STATUS);

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
