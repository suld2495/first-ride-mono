import axiosInstance, { createHttp, isPublicAuthUrl } from '@repo/shared/api';
import * as authApi from '@repo/shared/api/auth.api';
import type { RefreshTokenResponse } from '@repo/types';
import { AxiosHeaders } from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('인증 요청 정책', () => {
  const expiredAccessToken = 'expired-access-token';
  const initialRefreshToken = 'initial-refresh-token';
  const newAccessToken = 'new-access-token';
  const newRefreshToken = 'new-refresh-token';
  const userInfo: RefreshTokenResponse['userInfo'] = {
    userId: 'test-user',
    nickname: '테스트',
    motto: null,
    mottos: [],
    role: 'USER',
  };
  const clearTokens = jest.fn().mockResolvedValue(undefined);
  const onUnauthorized = jest.fn().mockResolvedValue(undefined);
  const saveTokens = jest.fn(
    async (nextAccessToken: string, nextRefreshToken: string) => {
      currentAccessToken = nextAccessToken;
      currentRefreshToken = nextRefreshToken;
    },
  );
  let currentAccessToken = expiredAccessToken;
  let currentRefreshToken = initialRefreshToken;

  beforeAll(() => {
    createHttp({
      baseURL: 'https://example.test',
      request: async (config) => {
        const headers = AxiosHeaders.from(config.headers);

        headers.set('Authorization', `Bearer ${currentAccessToken}`);

        return { ...config, headers };
      },
      onUnauthorized,
      tokenManager: {
        getAccessToken: async () => currentAccessToken,
        getRefreshToken: async () => currentRefreshToken,
        saveTokens,
        clearTokens,
        updateUser: jest.fn(),
      },
    });
  });

  beforeEach(() => {
    currentAccessToken = expiredAccessToken;
    currentRefreshToken = initialRefreshToken;
    jest.clearAllMocks();
  });

  it.each([
    '/auth/login',
    '/auth/refresh',
    '/auth/signup',
    '/auth/kakao/check',
    '/auth/kakao/login',
    '/auth/kakao/signup',
    '/auth/apple/nonce',
    '/auth/apple/check',
    '/auth/apple/login',
    '/auth/apple/signup',
  ])('%s 요청을 공개 인증 요청으로 분류한다', (url) => {
    expect(isPublicAuthUrl(url)).toBe(true);
  });

  it('보호된 인증 보조 API는 공개 요청으로 분류하지 않는다', () => {
    expect(isPublicAuthUrl('/auth/job-options')).toBe(false);
  });

  it('일반 API 401은 refresh 후 재시도하고 재시도가 401이어도 로그아웃하지 않는다', async () => {
    const mockAxios = new MockAdapter(axiosInstance);
    const refreshSpy = jest.spyOn(authApi, 'refreshToken').mockResolvedValue({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      userInfo,
    });

    mockAxios.onGet('/protected').reply(401, {
      success: false,
      error: {
        message: '유효하지 않은 토큰입니다.',
        code: 'TOKEN_INVALID',
      },
    });

    await expect(axiosInstance.get('/protected')).rejects.toBeDefined();

    expect(mockAxios.history.get).toHaveLength(2);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledWith({
      refreshToken: initialRefreshToken,
    });
    expect(saveTokens).toHaveBeenCalledWith(newAccessToken, newRefreshToken);
    expect(clearTokens).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();

    refreshSpy.mockRestore();
    mockAxios.restore();
  });

  it('refresh 실패 시에만 로컬 세션을 정리한다', async () => {
    const mockAxios = new MockAdapter(axiosInstance);
    const refreshError = new Error('refresh failed');
    const refreshSpy = jest
      .spyOn(authApi, 'refreshToken')
      .mockRejectedValue(refreshError);

    mockAxios.onGet('/refresh-fails').reply(401, {
      success: false,
      error: {
        message: '인증이 필요합니다.',
        code: 'TOKEN_INVALID',
      },
    });

    await expect(axiosInstance.get('/refresh-fails')).rejects.toBe(refreshError);

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(clearTokens).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    refreshSpy.mockRestore();
    mockAxios.restore();
  });
});
