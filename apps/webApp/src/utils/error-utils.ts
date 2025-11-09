import { ApiError } from '@repo/shared/api/AppError';

/**
 * API 에러 객체에서 사용자에게 보여줄 메시지를 추출합니다.
 * @param error - 발생한 에러 객체
 * @param fallbackMessage - ApiError가 아닐 경우 표시할 기본 메시지
 * @returns 사용자에게 표시할 에러 메시지
 */
export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallbackMessage;
};
