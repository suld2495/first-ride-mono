import type { AuthErrorCode, ErrorAraryData, ErrorData } from '@repo/types';
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

export const UN_AUTHORIZATION_URL = [
  '/auth/login',
  '/auth/refresh',
  '/auth/signup',
  '/auth/kakao/check',
  '/auth/kakao/login',
];

const SOCIAL_AUTH_URL_PATTERN = /^\/auth\/[^/?]+\/(?:check|login|signup)$/;

export const isPublicAuthUrl = (url: string = ''): boolean => {
  const [path] = url.split('?');

  return (
    UN_AUTHORIZATION_URL.includes(path) || SOCIAL_AUTH_URL_PATTERN.test(path)
  );
};

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
let refreshPromise: Promise<string> | null = null;
// 재시도한 요청의 ID를 추적
const retriedRequestIds = new Set<string>();

const axiosInstance = axios.create({
  headers: {
    Accept: 'application/json',
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
    isPublicAuthUrl(originalRequest.url) ||
    originalRequest.url?.includes('/auth/logout') === true
  );
};

const getAuthErrorCode = (error: AxiosError): AuthErrorCode | undefined => {
  const responseData = error.response?.data;

  if (!responseData || typeof responseData !== 'object') {
    return undefined;
  }

  const errorData = (responseData as { error?: unknown }).error;

  if (!errorData || typeof errorData !== 'object') {
    return undefined;
  }

  const { code } = errorData as { code?: unknown };

  return typeof code === 'string' ? (code as AuthErrorCode) : undefined;
};

const clearSessionAndHandleUnauthorized = async (
  activeTokenManager: TokenManager,
): Promise<void> => {
  await activeTokenManager.clearTokens();
  await handleUnauthorized();
};

const markRequestAsRetried = (requestId: string | undefined): void => {
  if (requestId) {
    retriedRequestIds.add(requestId);
  }
};

const clearRequestRetryState = (requestId: string | undefined): void => {
  if (requestId) {
    retriedRequestIds.delete(requestId);
  }
};

const retryWithLatestAccessToken = async (
  originalRequest: InternalAxiosRequestConfig,
  activeTokenManager: TokenManager,
  requestId: string | undefined,
): Promise<AxiosResponse | null> => {
  const currentAccessToken = await activeTokenManager.getAccessToken();
  const requestAuthorization = getHeaderValue(
    originalRequest,
    AUTHORIZATION_HEADER,
  );

  if (
    !currentAccessToken ||
    requestAuthorization === `Bearer ${currentAccessToken}`
  ) {
    return null;
  }

  markRequestAsRetried(requestId);
  setHeaderValue(
    originalRequest,
    AUTHORIZATION_HEADER,
    `Bearer ${currentAccessToken}`,
  );

  return axiosInstance(originalRequest);
};

const refreshAccessToken = async (
  activeTokenManager: TokenManager,
): Promise<string> => {
  const storedRefreshToken = await activeTokenManager.getRefreshToken();

  if (!storedRefreshToken) {
    throw new Error('Refresh token is missing.');
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

  return response.accessToken;
};

const runRefresh = async (
  activeTokenManager: TokenManager,
): Promise<string> => {
  try {
    return await refreshAccessToken(activeTokenManager);
  } catch (error) {
    await activeTokenManager.clearTokens();
    await handleUnauthorized();
    throw error;
  } finally {
    refreshPromise = null;
  }
};

const getRefreshPromise = (
  activeTokenManager: TokenManager,
): Promise<string> => {
  refreshPromise ??= runRefresh(activeTokenManager);

  return refreshPromise;
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    const requestId = getHeaderValue(response.config, REQUEST_ID_HEADER);

    if (requestId) {
      retriedRequestIds.delete(requestId);
    }

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
    const activeTokenManager = tokenManager;
    const latestTokenResponse = await retryWithLatestAccessToken(
      originalRequest,
      activeTokenManager,
      requestId,
    );

    if (latestTokenResponse) {
      return latestTokenResponse;
    }

    if (requestId && retriedRequestIds.has(requestId)) {
      clearRequestRetryState(requestId);
      await clearSessionAndHandleUnauthorized(activeTokenManager);
      throw error;
    }

    if (getAuthErrorCode(error) !== 'TOKEN_EXPIRED') {
      clearRequestRetryState(requestId);
      await clearSessionAndHandleUnauthorized(activeTokenManager);
      throw error;
    }

    markRequestAsRetried(requestId);

    try {
      const newAccessToken = await getRefreshPromise(activeTokenManager);

      setHeaderValue(
        originalRequest,
        AUTHORIZATION_HEADER,
        `Bearer ${newAccessToken}`,
      );

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearRequestRetryState(requestId);
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
export {
  checkEmailAvailability,
  confirmEmailVerification,
  fetchJobOptions,
  join,
  login,
  logout,
  requestEmailVerification,
  refreshToken,
} from './auth.api';
export { appleCheck, appleLogin, appleSignUp } from './apple-auth.api';
export {
  createRequest,
  fetchReceivedRequests,
  fetchRequestDetail,
  replyRequest,
} from './request.api';
export {
  createRoutine,
  deleteRoutine,
  fetchMonthlyRoutines,
  fetchPausedRoutines,
  fetchRoutineDetail,
  fetchRoutines,
  updateRoutine,
  updateRoutinePause,
  updateRoutineVisibility,
} from './routine.api';
export { distributeStats, fetchMyStats } from './stat.api';
export {
  fetchNotificationSettings,
  updateNotificationSettings,
} from './notification-settings.api';
