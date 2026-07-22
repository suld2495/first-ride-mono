import { ApiError } from '@repo/shared/api/AppError';
import http from '@repo/shared/api/client';

const INTERNAL_SERVER_ERROR_STATUS = 500;

/**
 * 푸시 토큰 업데이트 (서버에)
 */
export async function updatePushToken(
  pushToken: string,
  deviceType: 'ios' | 'android',
): Promise<boolean> {
  try {
    await http.put<
      void,
      { expoPushToken: string; deviceType: 'ios' | 'android' }
    >('/push-tokens', {
      expoPushToken: pushToken,
      deviceType,
    });

    return true;
  } catch (error) {
    throw new ApiError(
      [],
      INTERNAL_SERVER_ERROR_STATUS,
      '/push-tokens',
      error,
      '푸시 토큰 업데이트에 실패했습니다.',
    );
  }
}

/**
 * 푸시 토큰 삭제 (서버에서)
 */
export async function deletePushToken(pushToken: string): Promise<boolean> {
  try {
    await http.delete<void, never>(
      `/push-tokens/${encodeURIComponent(pushToken)}`,
    );

    return true;
  } catch (error) {
    throw new ApiError(
      [],
      INTERNAL_SERVER_ERROR_STATUS,
      `/push-tokens/${encodeURIComponent(pushToken)}`,
      error,
      '푸시 토큰 삭제에 실패했습니다.',
    );
  }
}
