import axiosInstance from '@repo/shared/api';
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
    const mockAxios = new MockAdapter(axiosInstance);
    const rawAxiosSpy = jest
      .spyOn(axios, 'put')
      .mockRejectedValue(new Error('raw axios must not be used'));

    mockedGetAuthorization.mockResolvedValue('access-token');
    mockAxios.onPut('/push-tokens').reply(200, { data: null });

    await updatePushToken('ExponentPushToken[test]', 'ios');

    expect(JSON.parse(mockAxios.history.put[0]?.data ?? '{}')).toEqual({
      expoPushToken: 'ExponentPushToken[test]',
      deviceType: 'ios',
    });
    expect(mockAxios.history.put[0]?.timeout).toBe(10_000);
    expect(rawAxiosSpy).not.toHaveBeenCalled();

    mockAxios.restore();
    rawAxiosSpy.mockRestore();
  });

  it('레거시 삭제 API에 URL 인코딩된 토큰을 전송한다', async () => {
    const mockAxios = new MockAdapter(axiosInstance);
    const rawAxiosSpy = jest
      .spyOn(axios, 'delete')
      .mockRejectedValue(new Error('raw axios must not be used'));

    mockedGetAuthorization.mockResolvedValue('access-token');
    mockAxios
      .onDelete('/push-tokens/ExponentPushToken%5Btest%5D')
      .reply(200, { data: null });

    await expect(deletePushToken('ExponentPushToken[test]')).resolves.toBe(
      true,
    );
    expect(mockAxios.history.delete[0]?.timeout).toBe(10_000);
    expect(rawAxiosSpy).not.toHaveBeenCalled();

    mockAxios.restore();
    rawAxiosSpy.mockRestore();
  });
});
