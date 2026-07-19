import { initializeKakaoSDK } from '@react-native-kakao/core';

import { getKakaoNativeAppKey } from '@/utils/env';

export async function initializeKakao(): Promise<void> {
  const nativeAppKey = getKakaoNativeAppKey();

  if (!nativeAppKey) {
    return;
  }

  await initializeKakaoSDK(nativeAppKey);
}
