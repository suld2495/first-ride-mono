import { login as apiLogin } from '@repo/shared/api/auth.api';

import {
  AuthProvider,
  AuthResponse,
  CredentialsPayload,
  DeviceInfo,
} from './types';

export interface CredentialsParams {
  userId: string;
  password: string;
}

class CredentialsAuthProvider
  implements AuthProvider<'credentials', CredentialsPayload, CredentialsParams>
{
  type = 'credentials' as const;
  name = '아이디/비밀번호';

  isAvailable(): boolean {
    return true;
  }

  async authenticate(params?: CredentialsParams): Promise<CredentialsPayload> {
    if (!params) {
      throw new Error('Credentials are required');
    }
    return {
      provider: 'credentials',
      userId: params.userId,
      password: params.password,
    };
  }

  async callApi(
    payload: CredentialsPayload,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResponse> {
    const result = await apiLogin({
      userId: payload.userId,
      password: payload.password,
      pushToken: deviceInfo.pushToken,
      deviceType: deviceInfo.deviceType,
    });

    return {
      isNewUser: false, // credentials 로그인은 항상 기존 회원
      userInfo: result.userInfo,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}

export const credentialsProvider = new CredentialsAuthProvider();
