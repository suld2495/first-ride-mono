import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { appleProvider } from '@/providers/auth/apple.provider';

const mockedSignInAsync = jest.mocked(AppleAuthentication.signInAsync);

describe('appleProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Apple 시스템 인증 결과를 백엔드 credential로 변환한다', async () => {
    mockedSignInAsync.mockResolvedValue({
      user: 'apple-user-id',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
    } as Awaited<ReturnType<typeof AppleAuthentication.signInAsync>>);

    await expect(appleProvider.authenticate()).resolves.toEqual({
      provider: 'apple',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
    });
    expect(mockedSignInAsync).toHaveBeenCalledWith({
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
