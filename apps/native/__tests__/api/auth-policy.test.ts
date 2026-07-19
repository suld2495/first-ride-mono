import axiosInstance, { createHttp, isPublicAuthUrl } from '@repo/shared/api';
import * as authApi from '@repo/shared/api/auth.api';
import { AxiosHeaders } from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('인증 요청 정책', () => {
  it.each([
    '/auth/login',
    '/auth/refresh',
    '/auth/signup',
    '/auth/kakao/check',
    '/auth/kakao/login',
    '/auth/kakao/signup',
  ])('%s 요청을 공개 인증 요청으로 분류한다', (url) => {
    expect(isPublicAuthUrl(url)).toBe(true);
  });

  it('보호된 인증 보조 API는 공개 요청으로 분류하지 않는다', () => {
    expect(isPublicAuthUrl('/auth/job-options')).toBe(false);
  });

  it('복구할 수 없는 토큰의 401은 refresh 없이 로컬 세션을 정리한다', async () => {
    const mockAxios = new MockAdapter(axiosInstance);
    const clearTokens = jest.fn().mockResolvedValue(undefined);
    const onUnauthorized = jest.fn().mockResolvedValue(undefined);
    const refreshSpy = jest.spyOn(authApi, 'refreshToken');

    createHttp({
      baseURL: 'https://example.test',
      request: async (config) => {
        const headers = AxiosHeaders.from(config.headers);

        headers.set('Authorization', 'Bearer invalid-access-token');

        return { ...config, headers };
      },
      onUnauthorized,
      tokenManager: {
        getAccessToken: async () => 'invalid-access-token',
        getRefreshToken: async () => 'refresh-token',
        saveTokens: jest.fn(),
        clearTokens,
        updateUser: jest.fn(),
      },
    });

    mockAxios.onGet('/protected').reply(401, {
      success: false,
      error: {
        message: '유효하지 않은 토큰입니다.',
        code: 'TOKEN_INVALID',
      },
    });

    await expect(axiosInstance.get('/protected')).rejects.toBeDefined();

    expect(refreshSpy).not.toHaveBeenCalled();
    expect(clearTokens).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    refreshSpy.mockRestore();
    mockAxios.restore();
  });
});
