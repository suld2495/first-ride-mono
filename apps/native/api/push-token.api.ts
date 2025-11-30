import axios from 'axios';

import { BASE_URL, getAuthorization } from '@/api';

/**
 * 푸시 토큰 업데이트 (서버에)
 */
export async function updatePushToken(
  userId: string,
  pushToken: string,
  deviceType: 'ios' | 'android',
): Promise<boolean> {
  try {
    const token = getAuthorization();

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
  } catch {
    return false;
  }
}

/**
 * 푸시 토큰 삭제 (서버에서)
 */
export async function deletePushToken(pushToken: string): Promise<boolean> {
  try {
    const token = getAuthorization();

    await axios.delete(
      `${BASE_URL}/push-tokens/${encodeURIComponent(pushToken)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return true;
  } catch {
    return false;
  }
}
