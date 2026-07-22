import axiosInstance from '@repo/shared/api';
import { deleteAccount } from '@repo/shared/api/auth.api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

describe('회원 탈퇴 API', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('일반 로그인 계정은 비밀번호를 DELETE body로 전송한다', async () => {
    mockAxios.onDelete('/auth/me').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        password: 'current-password',
      });

      return [200, { data: { message: '회원탈퇴가 완료되었습니다.' } }];
    });

    await expect(
      deleteAccount({ password: 'current-password' }),
    ).resolves.toEqual({ message: '회원탈퇴가 완료되었습니다.' });
  });

  it('소셜 로그인 계정은 request body 없이 DELETE한다', async () => {
    mockAxios.onDelete('/auth/me').reply((config) => {
      expect(config.data).toBeUndefined();

      return [200, { data: { message: '회원탈퇴가 완료되었습니다.' } }];
    });

    await expect(deleteAccount()).resolves.toEqual({
      message: '회원탈퇴가 완료되었습니다.',
    });
  });

  it('비밀번호 불일치 메시지를 API 오류로 전달한다', async () => {
    mockAxios.onDelete('/auth/me').reply(400, {
      success: false,
      error: { message: '비밀번호가 일치하지 않습니다.' },
    });

    await expect(deleteAccount({ password: 'wrong-password' })).rejects.toThrow(
      '비밀번호가 일치하지 않습니다.',
    );
  });
});
