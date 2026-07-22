import axiosInstance, { createHttp } from '@repo/shared/api';
import { AxiosHeaders } from 'axios';
import MockAdapter from 'axios-mock-adapter';

const PROTECTED_URL = '/retry-unauthorized';
const STALE_ACCESS_TOKEN = 'stale-access-token';
const LATEST_ACCESS_TOKEN = 'latest-access-token';

describe('갱신된 인증 요청의 401 처리', () => {
  const clearTokens = jest.fn<Promise<void>, []>();
  const onUnauthorized = jest.fn<Promise<void>, []>();

  beforeAll(() => {
    createHttp({
      baseURL: 'https://example.test',
      request: async (config) => ({
        ...config,
        headers: AxiosHeaders.from(config.headers),
      }),
      onUnauthorized,
      tokenManager: {
        getAccessToken: async () => LATEST_ACCESS_TOKEN,
        getRefreshToken: async () => 'refresh-token',
        saveTokens: async () => undefined,
        clearTokens,
        updateUser: jest.fn(),
      },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    clearTokens.mockResolvedValue(undefined);
    onUnauthorized.mockResolvedValue(undefined);
  });

  const requestThatRemainsUnauthorized = async () => {
    const mockAxios = new MockAdapter(axiosInstance);

    mockAxios.onGet(PROTECTED_URL).reply(401, {
      error: {
        code: 'TOKEN_INVALID',
        message: '인증이 필요합니다.',
      },
    });

    await expect(
      axiosInstance.get(PROTECTED_URL, {
        headers: { Authorization: `Bearer ${STALE_ACCESS_TOKEN}` },
      }),
    ).rejects.toBeDefined();

    const requestCount = mockAxios.history.get.length;
    mockAxios.restore();

    return requestCount;
  };

  it('최신 토큰 재시도도 401이면 토큰과 로컬 세션을 종료한다', async () => {
    await expect(requestThatRemainsUnauthorized()).resolves.toBe(2);

    expect(clearTokens).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('토큰 삭제가 실패해도 로컬 세션 종료 콜백을 실행한다', async () => {
    clearTokens.mockRejectedValueOnce(new Error('secure store failed'));

    await requestThatRemainsUnauthorized();

    expect(clearTokens).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('세션 종료 콜백이 실패해도 다음 401에서 다시 실행할 수 있다', async () => {
    onUnauthorized.mockRejectedValueOnce(new Error('callback failed'));

    await requestThatRemainsUnauthorized();
    await requestThatRemainsUnauthorized();

    expect(onUnauthorized).toHaveBeenCalledTimes(2);
  });
});
