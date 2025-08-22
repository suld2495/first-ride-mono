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

interface HttpConfig {
  baseURL: string;
  request: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
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
    return response.data;
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
    const { error: code, message } = errorData;

    return new ApiError(
      {
        code,
      },
      status,
      url,
      error,
      message,
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
