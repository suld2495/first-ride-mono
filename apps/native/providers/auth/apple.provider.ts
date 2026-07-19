import { appleCheck, appleLogin } from '@repo/shared/api/apple-auth.api';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import type {
  ApplePayload,
  AuthProvider,
  AuthResponse,
  DeviceInfo,
} from './types';

class AppleAuthProvider implements AuthProvider<'apple', ApplePayload, void> {
  type = 'apple' as const;
  name = 'Apple';

  isAvailable(): boolean {
    return Platform.OS === 'ios';
  }

  async authenticate(): Promise<ApplePayload> {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });

    if (!credential.identityToken) {
      throw new Error('Apple identityToken을 받지 못했습니다.');
    }

    return {
      provider: 'apple',
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode ?? undefined,
    };
  }

  async callApi(
    payload: ApplePayload,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResponse> {
    const check = await appleCheck({ identityToken: payload.identityToken });

    if (check.isNewUser) {
      return { isNewUser: true };
    }

    const response = await appleLogin({
      identityToken: payload.identityToken,
      authorizationCode: payload.authorizationCode,
      pushToken: deviceInfo.pushToken,
      deviceType: deviceInfo.deviceType,
      deviceId: deviceInfo.deviceId,
    });

    return {
      isNewUser: false,
      ...response,
    };
  }
}

export const appleProvider = new AppleAuthProvider();
