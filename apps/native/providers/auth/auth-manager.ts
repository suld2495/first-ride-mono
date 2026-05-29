import { getProvider } from './provider-registry';
import type { AuthProviderType, AuthResponse, DeviceInfo } from './types';

// AuthManager 결과 타입 (providerType 포함)
export interface AuthResult extends AuthResponse {
  providerType: AuthProviderType;
  socialAccessToken?: string;
}

class AuthManager {
  async login(
    providerType: AuthProviderType,
    deviceInfo: DeviceInfo,
    params?: unknown,
  ): Promise<AuthResult> {
    const provider = getProvider(providerType);

    // 1. Provider에서 인증 정보 획득
    const payload = await provider.authenticate(params);

    // 2. Provider가 자신의 API 호출
    const response = await provider.callApi(payload, deviceInfo);
    const socialAccessToken =
      response.isNewUser && 'accessToken' in payload
        ? payload.accessToken
        : undefined;

    return {
      ...response,
      socialAccessToken,
      providerType,
    };
  }

  async logout(providerType?: AuthProviderType): Promise<void> {
    if (providerType && providerType !== 'credentials') {
      const provider = getProvider(providerType);

      await provider.signOut?.();
    }
  }
}

export const authManager = new AuthManager();
