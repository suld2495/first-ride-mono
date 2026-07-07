import MockAdapter from 'axios-mock-adapter';

import {
  join,
  login,
  logout,
  normalizeTokenResponse,
  refreshToken,
} from '../auth.api';
import axiosInstance from '../index';

let mockAxios: MockAdapter;

const TEST_USER_INFO = {
  userId: 'testuser',
  nickname: 'Test User',
  motto: null,
  mottos: [],
  role: 'USER' as const,
};
const TEST_PASSWORD = 'password123';
const ACCESS_TOKEN = 'access-token';
const REFRESH_TOKEN = 'refresh-token';
const LOGGED_OUT_LOCALLY_MESSAGE = { message: 'Logged out locally' };
const LOGGED_OUT_SUCCESSFULLY_MESSAGE = { message: 'Logged out successfully' };
const NEW_ACCESS_TOKEN = 'new-access-token';
const NEW_REFRESH_TOKEN = 'new-refresh-token';
const THROW_ERROR_TEST_NAME = '에러를 throw한다';
const AUTH_REFRESH_URL = '/auth/refresh';
const AUTH_LOGOUT_URL = '/auth/logout';

describe('auth.api', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('login', () => {
    const loginForm = {
      userId: 'testuser',
      password: TEST_PASSWORD,
    };

    describe('성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(200, {
          data: {
            userInfo: TEST_USER_INFO,
            accessToken: ACCESS_TOKEN,
            refreshToken: REFRESH_TOKEN,
          },
        });
      });

      it('로그인 응답을 반환한다', async () => {
        const result = await login(loginForm);

        expect(result).toEqual({
          userInfo: TEST_USER_INFO,
          accessToken: ACCESS_TOKEN,
          refreshToken: REFRESH_TOKEN,
        });
      });
    });

    describe('실패 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(400, {
          error: {
            message: '로그인 실패',
            data: [
              {
                field: 'userId',
                message: '아이디 또는 비밀번호가 잘못되었습니다',
              },
            ],
          },
        });
      });

      it(THROW_ERROR_TEST_NAME, async () => {
        await expect(login(loginForm)).rejects.toThrow();
      });
    });
  });

  describe('join', () => {
    const joinForm = {
      userId: 'newuser',
      password: TEST_PASSWORD,
      nickname: 'New User',
      job: '개발자',
    };

    describe('성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/signup').reply(200, { data: null });
      });

      it('undefined를 반환한다', async () => {
        const result = await join(joinForm);

        expect(result).toBeUndefined();
      });
    });

    describe('실패 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/signup').reply(400, {
          error: {
            message: '회원가입 실패',
            data: [{ field: 'userId', message: '이미 존재하는 아이디입니다' }],
          },
        });
      });

      it(THROW_ERROR_TEST_NAME, async () => {
        await expect(join(joinForm)).rejects.toThrow();
      });
    });
  });

  describe('refreshToken', () => {
    const refreshTokenRequest = {
      refreshToken: 'valid-refresh-token',
    };

    describe('성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost(AUTH_REFRESH_URL).reply(200, {
          data: {
            userInfo: TEST_USER_INFO,
            accessToken: NEW_ACCESS_TOKEN,
            refreshToken: NEW_REFRESH_TOKEN,
          },
        });
      });

      it('새로운 토큰을 반환한다', async () => {
        const result = await refreshToken(refreshTokenRequest);

        expect(result).toEqual({
          userInfo: TEST_USER_INFO,
          accessToken: NEW_ACCESS_TOKEN,
          refreshToken: NEW_REFRESH_TOKEN,
        });
      });
    });

    describe('실패 시', () => {
      describe('유효하지 않은 refreshToken인 경우', () => {
        beforeEach(() => {
          mockAxios.onPost(AUTH_REFRESH_URL).reply(401, {
            error: {
              message: 'Invalid refresh token',
            },
          });
        });

        it(THROW_ERROR_TEST_NAME, async () => {
          await expect(refreshToken(refreshTokenRequest)).rejects.toThrow();
        });
      });

      describe('만료된 refreshToken인 경우', () => {
        beforeEach(() => {
          mockAxios.onPost(AUTH_REFRESH_URL).reply(401, {
            error: {
              message: 'Refresh token expired',
            },
          });
        });

        it(THROW_ERROR_TEST_NAME, async () => {
          await expect(refreshToken(refreshTokenRequest)).rejects.toThrow();
        });
      });
    });
  });

  describe('normalizeTokenResponse', () => {
    it('refresh 응답의 user 필드를 userInfo로 정규화한다', () => {
      const result = normalizeTokenResponse({
        accessToken: NEW_ACCESS_TOKEN,
        refreshToken: NEW_REFRESH_TOKEN,
        user: TEST_USER_INFO,
      });

      expect(result).toEqual({
        userInfo: TEST_USER_INFO,
        accessToken: NEW_ACCESS_TOKEN,
        refreshToken: NEW_REFRESH_TOKEN,
      });
    });
  });

  describe('logout', () => {
    describe('성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost(AUTH_LOGOUT_URL).reply(200, {
          data: LOGGED_OUT_SUCCESSFULLY_MESSAGE,
        });
      });

      it('로그아웃 응답을 반환한다', async () => {
        const result = await logout();

        expect(result).toEqual(LOGGED_OUT_SUCCESSFULLY_MESSAGE);
      });
    });

    describe('실패 시', () => {
      beforeEach(() => {
        mockAxios.onPost(AUTH_LOGOUT_URL).reply(500, {
          error: {
            message: 'Server error',
          },
        });
      });

      it('로컬 로그아웃 메시지를 반환한다', async () => {
        const result = await logout();

        expect(result).toEqual(LOGGED_OUT_LOCALLY_MESSAGE);
      });
    });

    describe('네트워크 오류 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost(AUTH_LOGOUT_URL).networkError();
      });

      it('로컬 로그아웃 메시지를 반환한다', async () => {
        const result = await logout();

        expect(result).toEqual(LOGGED_OUT_LOCALLY_MESSAGE);
      });
    });
  });
});
