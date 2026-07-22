import { authManager } from '@/providers/auth/auth-manager';
import { getProvider } from '@/providers/auth/provider-registry';
import type { RuntimeAuthProvider } from '@/providers/auth/provider-registry';

jest.mock('@/providers/auth/provider-registry', () => ({
  getProvider: jest.fn(),
}));

const mockedGetProvider = jest.mocked(getProvider);

describe('authManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기존 SNS 회원 로그인 시 서버가 발급한 서비스 토큰을 반환한다', async () => {
    const provider = {
      authenticate: jest.fn().mockResolvedValue({
        provider: 'kakao',
        socialId: '12345',
        accessToken: 'kakao-access-token',
        expiresAt: 2_000_000_000_000,
      }),
      callApi: jest.fn().mockResolvedValue({
        isNewUser: false,
        userInfo: { userId: 'testuser', nickname: '테스터' },
        accessToken: 'service-access-token',
        refreshToken: 'service-refresh-token',
      }),
    } as unknown as RuntimeAuthProvider;

    mockedGetProvider.mockReturnValue(provider);

    await expect(
      authManager.login('kakao', {
        deviceType: 'ios',
        deviceId: 'installation-device-id',
      }),
    ).resolves.toMatchObject({
      isNewUser: false,
      accessToken: 'service-access-token',
      refreshToken: 'service-refresh-token',
      providerType: 'kakao',
    });
  });

  it('신규 SNS 회원이면 전체 credential을 임시 인증 정보로 반환한다', async () => {
    const provider = {
      authenticate: jest.fn().mockResolvedValue({
        provider: 'kakao',
        socialId: '12345',
        accessToken: 'kakao-access-token',
        expiresAt: 2_000_000_000_000,
      }),
      callApi: jest.fn().mockResolvedValue({
        isNewUser: true,
      }),
    } as unknown as RuntimeAuthProvider;

    mockedGetProvider.mockReturnValue(provider);

    await expect(
      authManager.login('kakao', {
        deviceType: 'ios',
        deviceId: 'installation-device-id',
      }),
    ).resolves.toMatchObject({
      isNewUser: true,
      providerType: 'kakao',
      pendingCredential: {
        provider: 'kakao',
        socialId: '12345',
        accessToken: 'kakao-access-token',
        expiresAt: 2_000_000_000_000,
      },
    });
  });
});
