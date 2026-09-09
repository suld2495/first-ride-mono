import {
  ApiError,
  AppError,
  HttpError,
  NetworkError,
  TimeoutError,
} from '@repo/shared/api/AppError';
import axios, { AxiosHeaders } from 'axios';

import type {
  NotificationDeepLinkData,
  NotificationResponse,
} from '@/types/notification-types';

export type NotificationHandlingStage =
  | 'notification-data'
  | 'detail-request'
  | 'detail-response'
  | 'navigation';

export class NotificationProcessingError extends Error {
  constructor(
    readonly stage: NotificationHandlingStage,
    readonly originalError: unknown,
  ) {
    super(`Notification handling failed during ${stage}.`);
    this.name = 'NotificationProcessingError';
  }
}

export type NotificationErrorDetails = {
  name: string;
  message: string;
  stack?: string;
  status?: number;
  code?: string;
  url?: string;
  requestId?: string;
  cause?: NotificationErrorDetails;
};

const NOTIFICATION_ERROR_MESSAGES = {
  auth: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  permission: '이 알림을 확인할 권한이 없습니다.',
  notFound: '삭제되었거나 더 이상 확인할 수 없는 인증 요청입니다.',
  service:
    '네트워크 또는 서버 오류로 알림을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
  data: '알림 정보가 올바르지 않습니다. 잠시 후 다시 시도해주세요.',
  response: '알림 데이터를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
  navigation: '알림 화면을 열지 못했습니다. 다시 시도해주세요.',
  detailRequest: '알림 상세 정보를 불러오지 못했습니다. 다시 시도해주세요.',
} as const;

const normalizeErrorCode = (code: string | undefined): string =>
  code?.replace(/[\s-]/g, '_').toUpperCase() ?? '';

const unwrapNotificationError = (error: unknown): unknown => {
  let unwrappedError = error;

  while (unwrappedError instanceof NotificationProcessingError) {
    unwrappedError = unwrappedError.originalError;
  }

  return unwrappedError;
};

const getErrorCode = (error: unknown): string => {
  const unwrappedError = unwrapNotificationError(error);

  return unwrappedError instanceof ApiError
    ? normalizeErrorCode(unwrappedError.code)
    : '';
};

const getErrorStatus = (error: unknown): number | undefined => {
  const unwrappedError = unwrapNotificationError(error);

  return unwrappedError instanceof HttpError
    ? unwrappedError.status
    : undefined;
};

const getErrorUrl = (error: unknown): string | undefined => {
  const unwrappedError = unwrapNotificationError(error);

  return unwrappedError instanceof HttpError ? unwrappedError.url : undefined;
};

const isRefreshRequest = (url: string | undefined): boolean => {
  if (!url) {
    return false;
  }

  return url.split('?')[0]?.endsWith('/auth/refresh') ?? false;
};

const isAuthErrorCode = (code: string): boolean =>
  /(?:TOKEN|SESSION|LOGIN|REFRESH|AUTHENTICATION|UNAUTHORIZED)/.test(code);

const isPermissionErrorCode = (code: string): boolean =>
  /(?:ACCESS|PERMISSION|FORBIDDEN|AUTHORIZATION|DENIED)/.test(code);

const isNotFoundErrorCode = (code: string): boolean =>
  /(?:NOT_FOUND|NOTFOUND|DELETED|REMOVED|NO_SUCH|DOES_NOT_EXIST|EXPIRED)/.test(
    code,
  );

const isServiceError = (error: unknown, status: number | undefined): boolean =>
  error instanceof NetworkError ||
  error instanceof TimeoutError ||
  status === 408 ||
  (status !== undefined && status >= 500);

const getHttpRequestId = (error: unknown): string | undefined => {
  const unwrappedError = unwrapNotificationError(error);
  const originalError =
    unwrappedError instanceof AppError
      ? unwrappedError.originalError
      : unwrappedError;

  if (!axios.isAxiosError(originalError)) {
    return undefined;
  }

  const requestId = AxiosHeaders.from(originalError.config?.headers).get(
    'X-Request-ID',
  );

  return typeof requestId === 'string' ? requestId : undefined;
};

export const getNotificationHandlingStage = (
  error: unknown,
  fallbackStage: NotificationHandlingStage,
): NotificationHandlingStage =>
  error instanceof NotificationProcessingError ? error.stage : fallbackStage;

export const getNotificationErrorMessage = (
  error: unknown,
  stage: NotificationHandlingStage,
): string => {
  if (stage === 'navigation') {
    return NOTIFICATION_ERROR_MESSAGES.navigation;
  }

  const status = getErrorStatus(error);
  const code = getErrorCode(error);
  const url = getErrorUrl(error);

  if (isRefreshRequest(url) || status === 401 || isAuthErrorCode(code)) {
    return NOTIFICATION_ERROR_MESSAGES.auth;
  }

  if (status === 403 || isPermissionErrorCode(code)) {
    return NOTIFICATION_ERROR_MESSAGES.permission;
  }

  if (status === 404 || status === 410 || isNotFoundErrorCode(code)) {
    return NOTIFICATION_ERROR_MESSAGES.notFound;
  }

  if (isServiceError(unwrapNotificationError(error), status)) {
    return NOTIFICATION_ERROR_MESSAGES.service;
  }

  switch (stage) {
    case 'notification-data':
      return NOTIFICATION_ERROR_MESSAGES.data;
    case 'detail-response':
      return NOTIFICATION_ERROR_MESSAGES.response;
    case 'detail-request':
      return NOTIFICATION_ERROR_MESSAGES.detailRequest;
  }
};

const getErrorDetails = (error: unknown): NotificationErrorDetails => {
  const unwrappedError = unwrapNotificationError(error);
  const details: NotificationErrorDetails =
    unwrappedError instanceof Error
      ? {
          name: unwrappedError.name,
          message: unwrappedError.message,
          ...(unwrappedError.stack ? { stack: unwrappedError.stack } : {}),
        }
      : {
          name: typeof unwrappedError,
          message: String(unwrappedError),
        };

  if (unwrappedError instanceof HttpError) {
    details.status = unwrappedError.status;
    details.url = unwrappedError.url;
  }

  if (unwrappedError instanceof ApiError && unwrappedError.code) {
    details.code = unwrappedError.code;
  }

  const requestId = getHttpRequestId(unwrappedError);

  if (requestId) {
    details.requestId = requestId;
  }

  if (unwrappedError instanceof AppError) {
    const cause = unwrappedError.originalError;

    if (cause !== unwrappedError) {
      details.cause = getErrorDetails(cause);
    }
  }

  return details;
};

export const getNotificationErrorDetails = (
  error: unknown,
): NotificationErrorDetails => getErrorDetails(error);

const getPositiveInteger = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return undefined;
  }

  return value;
};

const getNotificationTargetId = (
  data: NotificationDeepLinkData | undefined,
): number | undefined =>
  getPositiveInteger(data?.requestId) ??
  getPositiveInteger(data?.confirmId) ??
  getPositiveInteger(data?.routineId);

export const logNotificationProcessingError = ({
  response,
  data,
  stage,
  error,
}: {
  response: NotificationResponse;
  data: NotificationDeepLinkData | undefined;
  stage: NotificationHandlingStage;
  error: unknown;
}): void => {
  const errorDetails = getErrorDetails(error);

  console.error('[Notification] response handling failed', {
    stage,
    notificationId: response.notification.request.identifier,
    actionIdentifier: response.actionIdentifier,
    type: data?.type,
    requestId: getPositiveInteger(data?.requestId),
    targetId: getNotificationTargetId(data),
    error: errorDetails,
  });
};
