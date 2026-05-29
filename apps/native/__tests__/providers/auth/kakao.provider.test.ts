import { login, me } from '@react-native-kakao/user';

import { kakaoProvider } from '@/providers/auth/kakao.provider';

const mockedLogin = jest.mocked(login);
const mockedMe = jest.mocked(me);

describe('kakaoProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('카카오 로그인 완료 후 사용자 정보를 조회한다', async () => {
    let isLoginComplete = false;

    mockedLogin.mockImplementation(async () => {
      await Promise.resolve();
      isLoginComplete = true;

      return { accessToken: 'kakao-access-token' } as Awaited<
        ReturnType<typeof login>
      >;
    });
    mockedMe.mockImplementation(async () => {
      if (!isLoginComplete) {
        throw new Error('카카오 로그인 완료 전에 사용자 정보를 조회했습니다.');
      }

      return { id: 12345 } as Awaited<ReturnType<typeof me>>;
    });

    await expect(kakaoProvider.authenticate()).resolves.toEqual({
      provider: 'kakao',
      socialId: '12345',
      accessToken: 'kakao-access-token',
    });
  });
});
