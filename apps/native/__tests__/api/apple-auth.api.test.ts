import axiosInstance, { appleNonce } from '@repo/shared/api';
import {
  appleCheck,
  appleLogin,
  appleSignUp,
} from '@repo/shared/api/apple-auth.api';
import MockAdapter from 'axios-mock-adapter';

describe('Apple 인증 API', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('Apple 로그인 전에 일회성 nonce를 발급받는다', async () => {
    mockAxios.onPost('/auth/apple/nonce').reply(200, {
      data: {
        nonceId: 'apple-nonce-id',
        nonce: 'apple-nonce',
        expiresAt: '2026-07-19T12:05:00Z',
      },
    });

    await expect(appleNonce()).resolves.toEqual({
      nonceId: 'apple-nonce-id',
      nonce: 'apple-nonce',
      expiresAt: '2026-07-19T12:05:00Z',
    });
    expect(mockAxios.history.post[0]?.url).toBe('/auth/apple/nonce');
  });

  it('check에는 nonceId와 identityToken을 전송한다', async () => {
    mockAxios.onPost('/auth/apple/check').reply(200, {
      data: {
        isNewUser: true,
        appleUserInfo: {
          appleId: 'apple-user-id',
          email: 'relay@privaterelay.appleid.com',
          nickname: null,
        },
      },
    });

    await expect(
      appleCheck({
        nonceId: 'apple-nonce-id',
        identityToken: 'apple-identity-token',
      }),
    ).resolves.toMatchObject({ isNewUser: true });
    expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toEqual({
      nonceId: 'apple-nonce-id',
      identityToken: 'apple-identity-token',
    });
  });

  it('기존 사용자 login에는 Apple 인증값과 기기 정보를 전송한다', async () => {
    mockAxios.onPost('/auth/apple/login').reply(200, {
      data: {
        accessToken: 'service-access-token',
        refreshToken: 'service-refresh-token',
        userInfo: { userId: 'apple_user', nickname: '애플 사용자' },
      },
    });

    await appleLogin({
      nonceId: 'apple-nonce-id',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
      pushToken: 'push-token',
      deviceType: 'ios',
      deviceId: 'installation-device-id',
    });

    expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toEqual({
      nonceId: 'apple-nonce-id',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
      pushToken: 'push-token',
      deviceType: 'ios',
      deviceId: 'installation-device-id',
    });
  });

  it('신규 사용자 signup에는 성별을 포함한 추가 정보를 전송한다', async () => {
    mockAxios.onPost('/auth/apple/signup').reply(201, {
      data: {
        accessToken: 'service-access-token',
        refreshToken: 'service-refresh-token',
        userInfo: { userId: 'apple_user', nickname: '애플 사용자' },
      },
    });

    await appleSignUp({
      nonceId: 'apple-nonce-id',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
      nickname: '애플 사용자',
      job: '개발자',
      gender: 'FEMALE',
      pushToken: 'push-token',
      deviceType: 'ios',
      deviceId: 'installation-device-id',
    });

    expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toEqual({
      nonceId: 'apple-nonce-id',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
      nickname: '애플 사용자',
      job: '개발자',
      gender: 'FEMALE',
      pushToken: 'push-token',
      deviceType: 'ios',
      deviceId: 'installation-device-id',
    });
  });
});
