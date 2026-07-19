import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { deletePushToken, updatePushToken } from '@/api/push-token.api';
import { getAuthorization } from '@/api/token-storage.api';

jest.mock('@/api/token-storage.api', () => ({
  BASE_URL: 'https://example.test/api',
  getAuthorization: jest.fn(),
}));

const mockedGetAuthorization = jest.mocked(getAuthorization);

describe('push token API', () => {
  it('레거시 등록 API에 expoPushToken 필드로 전송한다', async () => {
    const mockAxios = new MockAdapter(axios);

    mockedGetAuthorization.mockResolvedValue('access-token');
    mockAxios.onPut('https://example.test/api/push-tokens').reply(200);

    await updatePushToken('ExponentPushToken[test]', 'ios');

    expect(JSON.parse(mockAxios.history.put[0]?.data ?? '{}')).toEqual({
      expoPushToken: 'ExponentPushToken[test]',
      deviceType: 'ios',
    });

    mockAxios.restore();
  });

  it('레거시 삭제 API에 URL 인코딩된 토큰을 전송한다', async () => {
    const mockAxios = new MockAdapter(axios);

    mockedGetAuthorization.mockResolvedValue('access-token');
    mockAxios
      .onDelete(
        'https://example.test/api/push-tokens/ExponentPushToken%5Btest%5D',
      )
      .reply(200);

    await expect(deletePushToken('ExponentPushToken[test]')).resolves.toBe(
      true,
    );
    expect(mockAxios.history.delete[0]?.headers?.Authorization).toBe(
      'Bearer access-token',
    );

    mockAxios.restore();
  });
});
