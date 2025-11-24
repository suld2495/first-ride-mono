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

/**
 * API 에러 객체에서 필드별 에러 메시지를 추출합니다.
 * @param error - 발생한 에러 객체
 * @returns 필드명을 키로 하고 에러 메시지를 값으로 하는 객체
 */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (error instanceof ApiError) {
    const details = error.detail;

    if (Array.isArray(details)) {
      return Object.fromEntries(
        details.map((item) => [item.field, item.message]),
      );
    }
  }
  return {};
};
