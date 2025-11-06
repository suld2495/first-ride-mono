import { ErrorAraryData, ErrorData } from '@repo/types';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { errorMessages } from '../error/error-message';

import {
  ApiError,
  AppError,
  HttpError,
  NetworkError,
  TimeoutError,
  UnknownError,
} from './AppError';

export const UN_AUTHORIZATION_URL = ['/login', '/join'];

interface HttpConfig {
  baseURL: string;
  request:
    | ((config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig)
    | ((
        config: InternalAxiosRequestConfig,
      ) => Promise<InternalAxiosRequestConfig>);
}

const axiosInstance = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

export const createHttp = (config: HttpConfig) => {
  axiosInstance.defaults.baseURL = config.baseURL;
  axiosInstance.interceptors.request.use(config.request);
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data.data;
  },
  async (error: AxiosError) => {
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
    const { error: code } = errorData;

    return new ApiError(
      {
        code,
      },
      status,
      url,
      error,
      errorMessages[code],
    );
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
