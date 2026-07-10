import axiosInstance, { createHttp } from '@repo/shared/api';
import * as authApi from '@repo/shared/api/auth.api';
import type { RefreshTokenResponse } from '@repo/types';
import axios, { AxiosHeaders } from 'axios';
import MockAdapter from 'axios-mock-adapter';

const EXPIRED_ACCESS_TOKEN = 'expired-access-token';
const INITIAL_REFRESH_TOKEN = 'initial-refresh-token';
const NEW_ACCESS_TOKEN = 'new-access-token';
const NEW_REFRESH_TOKEN = 'new-refresh-token';
const PROTECTED_URL = '/protected';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

const createDeferred = <T>(): Deferred<T> => {
  let resolvePromise: Deferred<T>['resolve'] = () => undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return { promise, resolve: resolvePromise };
};

describe('인증 토큰 갱신 동시성', () => {
  it('refresh 완료 후 늦게 도착한 이전 토큰의 401은 최신 토큰으로만 재요청한다', async () => {
    const mockAxios = new MockAdapter(axiosInstance);
    const refreshStarted = createDeferred<void>();
    const delayedRequestReachedServer = createDeferred<void>();
    const refreshResponse = createDeferred<RefreshTokenResponse>();
    const delayedUnauthorizedResponse =
      createDeferred<[number, Record<string, never>]>();
    const onUnauthorized = jest.fn().mockResolvedValue(undefined);
    let accessToken = EXPIRED_ACCESS_TOKEN;
    let refreshToken = INITIAL_REFRESH_TOKEN;
    let expiredTokenRequestCount = 0;

    const refreshTokenSpy = jest
      .spyOn(authApi, 'refreshToken')
      .mockImplementation(() => {
        refreshStarted.resolve();
        return refreshResponse.promise;
      });

    createHttp({
      baseURL: 'https://example.test',
      request: async (config) => {
        const headers = AxiosHeaders.from(config.headers);

        headers.set('Authorization', `Bearer ${accessToken}`);

        return { ...config, headers };
      },
      onUnauthorized,
      tokenManager: {
        getAccessToken: async () => accessToken,
        getRefreshToken: async () => refreshToken,
        saveTokens: async (nextAccessToken, nextRefreshToken) => {
          accessToken = nextAccessToken;
          refreshToken = nextRefreshToken;
        },
        clearTokens: async () => {
          accessToken = '';
          refreshToken = '';
        },
        updateUser: jest.fn(),
      },
    });

    mockAxios.onGet(PROTECTED_URL).reply((config) => {
      const authorization = config.headers?.Authorization;

      if (authorization === `Bearer ${EXPIRED_ACCESS_TOKEN}`) {
        expiredTokenRequestCount += 1;

        if (expiredTokenRequestCount === 3) {
          delayedRequestReachedServer.resolve();
          return delayedUnauthorizedResponse.promise;
        }

        return [axios.HttpStatusCode.Unauthorized, {}];
      }

      return [axios.HttpStatusCode.Ok, { data: { ok: true } }];
    });

    const firstRequest = axiosInstance.get(PROTECTED_URL);
    const secondRequest = axiosInstance.get(PROTECTED_URL);
    const delayedRequest = axiosInstance.get(PROTECTED_URL);

    await Promise.all([
      refreshStarted.promise,
      delayedRequestReachedServer.promise,
    ]);

    refreshResponse.resolve({
      accessToken: NEW_ACCESS_TOKEN,
      refreshToken: NEW_REFRESH_TOKEN,
      userInfo: {
        userId: 'test-user',
        nickname: '테스트',
        motto: null,
        mottos: [],
        role: 'USER',
      },
    });

    await Promise.all([firstRequest, secondRequest]);

    delayedUnauthorizedResponse.resolve([
      axios.HttpStatusCode.Unauthorized,
      {},
    ]);

    await delayedRequest;

    expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).not.toHaveBeenCalled();

    mockAxios.restore();
    refreshTokenSpy.mockRestore();
  });
});
