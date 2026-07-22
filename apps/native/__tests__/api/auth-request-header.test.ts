import axiosInstance from '@repo/shared/api';
import { AxiosHeaders } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as SecureStore from 'expo-secure-store';

import '@/api/bootstrap.api';

const mockedGetItemAsync = jest.mocked(SecureStore.getItemAsync);

describe('인증 요청 헤더', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onAny().reply(200, { data: { ok: true } });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  const requestAuthorization = async (
    url: string,
  ): Promise<string | null | undefined> => {
    await axiosInstance.get(url);
    const headers = mockAxios.history.get[0]?.headers;
    const authorization =
      headers instanceof AxiosHeaders
        ? headers.get('Authorization')
        : headers?.Authorization;

    return typeof authorization === 'string' ? authorization : undefined;
  };

  it.each([null, '', '   '])(
    '토큰이 %p이면 보호 API에도 Bearer 헤더를 보내지 않는다',
    async (token) => {
      mockedGetItemAsync.mockResolvedValue(token);

      await expect(requestAuthorization('/protected')).resolves.toBeUndefined();
    },
  );

  it('토큰이 있으면 보호 API에만 Bearer 헤더를 보낸다', async () => {
    mockedGetItemAsync.mockResolvedValue('valid-access-token');

    await expect(requestAuthorization('/protected')).resolves.toBe(
      'Bearer valid-access-token',
    );
  });

  it.each([
    '/auth/email/check',
    '/auth/email/verification-requests',
    '/auth/email/verification-confirm',
    '/auth/job-options',
  ])('%s 공개 API에는 저장된 토큰을 보내지 않는다', async (url) => {
    mockedGetItemAsync.mockResolvedValue('valid-access-token');

    await expect(requestAuthorization(url)).resolves.toBeUndefined();
    expect(mockedGetItemAsync).not.toHaveBeenCalled();
  });
});
