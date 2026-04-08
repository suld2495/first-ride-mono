import { ApiError } from '@repo/shared/api/AppError';
import axios from 'axios';

import { BASE_URL, getAuthorization } from '@/api/token-storage.api';

const INTERNAL_SERVER_ERROR_STATUS = 500;

/**
 * 푸시 토큰 업데이트 (서버에)
 */
export async function updatePushToken(
  userId: string,
  pushToken: string,
  deviceType: 'ios' | 'android',
): Promise<boolean> {
  try {
    const token = await getAuthorization();

    await axios.put(
      `${BASE_URL}/push-tokens`,
      {
        userId,
        pushToken,
        deviceType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

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
    const token = await getAuthorization();

    await axios.delete(
      `${BASE_URL}/push-tokens/${encodeURIComponent(pushToken)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
