import {
  socialLogin,
  socialLoginCheck,
} from '@repo/shared/api/social-auth.api';

import {
  AuthProvider,
  AuthResponse,
  DeviceInfo,
  SocialPayload,
  SocialProviderType,
} from '../types';

export abstract class SocialAuthProvider
  implements AuthProvider<SocialProviderType, SocialPayload, void>
{
  abstract type: SocialProviderType;
  abstract name: string;

  // 기본적으로 모든 플랫폼에서 사용 가능 (override 가능)
  isAvailable(): boolean {
    return true;
  }

  // 각 SNS별로 구현해야 하는 메서드
  abstract authenticate(): Promise<SocialPayload>;

  // 공통 API 호출 로직 - 모든 SNS Provider가 동일한 API 사용
  async callApi(
    payload: SocialPayload,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResponse> {
    const param = {
      provider: payload.provider,
      socialId: payload.socialId,
      accessToken: payload.accessToken,
      idToken: payload.idToken,
      pushToken: deviceInfo.pushToken,
      deviceType: deviceInfo.deviceType,
    };

    const check = await socialLoginCheck(param);

    if (!check.isNewUser) {
      return socialLogin(param);
    }

    return check;
  }

  // 소셜 로그아웃 (optional, override 가능)
  async signOut(): Promise<void> {
    // 기본 구현 없음 - 필요한 Provider에서 override
  }
}
