import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { appleProvider } from '@/providers/auth/apple.provider';

const mockedSignInAsync = jest.mocked(AppleAuthentication.signInAsync);

describe('appleProvider', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onPost('/auth/apple/nonce').reply(200, {
      data: {
        nonceId: 'apple-nonce-id',
        nonce: 'apple-nonce',
        expiresAt: '2026-07-19T12:05:00Z',
      },
    });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('Apple 시스템 인증 결과를 백엔드 credential로 변환한다', async () => {
    mockedSignInAsync.mockResolvedValue({
      user: 'apple-user-id',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
    } as Awaited<ReturnType<typeof AppleAuthentication.signInAsync>>);

    await expect(appleProvider.authenticate()).resolves.toEqual({
      provider: 'apple',
      nonceId: 'apple-nonce-id',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
    });
    expect(mockedSignInAsync).toHaveBeenCalledWith({
      nonce: 'apple-nonce',
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
  });

  it('iOS에서만 사용할 수 있다', () => {
    const originalPlatform = Platform.OS;

    try {
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: 'ios',
      });
      expect(appleProvider.isAvailable()).toBe(true);

      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: 'android',
      });
      expect(appleProvider.isAvailable()).toBe(false);
    } finally {
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: originalPlatform,
      });
    }
  });

  it('check와 login에 같은 nonceId를 전달한다', async () => {
    mockAxios.onPost('/auth/apple/check').reply(200, {
      data: {
        isNewUser: false,
        appleUserInfo: {
          appleId: 'apple-user-id',
          email: 'relay@privaterelay.appleid.com',
          nickname: '애플 사용자',
        },
      },
    });
    mockAxios.onPost('/auth/apple/login').reply(200, {
      data: {
        accessToken: 'service-access-token',
        refreshToken: 'service-refresh-token',
        userInfo: { userId: 'apple_user', nickname: '애플 사용자' },
      },
    });

    await appleProvider.callApi(
      {
        provider: 'apple',
        nonceId: 'apple-nonce-id',
        identityToken: 'apple-identity-token',
        authorizationCode: 'apple-authorization-code',
      },
      {
        pushToken: 'push-token',
        deviceType: 'ios',
        deviceId: 'installation-device-id',
      },
    );

    expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toEqual({
      nonceId: 'apple-nonce-id',
      identityToken: 'apple-identity-token',
    });
    expect(JSON.parse(mockAxios.history.post[1]?.data ?? '{}')).toEqual({
      nonceId: 'apple-nonce-id',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
      pushToken: 'push-token',
      deviceType: 'ios',
      deviceId: 'installation-device-id',
    });
  });

  it('identityToken이 없으면 서버 요청 전에 실패한다', async () => {
    mockedSignInAsync.mockResolvedValue({
      user: 'apple-user-id',
      identityToken: null,
      authorizationCode: 'apple-authorization-code',
    } as Awaited<ReturnType<typeof AppleAuthentication.signInAsync>>);

    await expect(appleProvider.authenticate()).rejects.toThrow(
      'Apple identityToken을 받지 못했습니다.',
    );
  });
});
