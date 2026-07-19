import axiosInstance from '@repo/shared/api';
import { logout } from '@repo/shared/api/auth.api';
import MockAdapter from 'axios-mock-adapter';

describe('로그아웃 API', () => {
  it('현재 기기의 refresh token을 body로 전송한다', async () => {
    const mockAxios = new MockAdapter(axiosInstance);

    mockAxios.onPost('/auth/logout').reply(200, {
      data: { message: '로그아웃되었습니다.' },
    });

    await expect(
      logout({ refreshToken: 'current-device-refresh-token' }),
    ).resolves.toEqual({ message: '로그아웃되었습니다.' });
    expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toEqual({
      refreshToken: 'current-device-refresh-token',
    });

    mockAxios.restore();
  });
});
