import MockAdapter from 'axios-mock-adapter';

import axiosInstance from '../index';
import { login, join, refreshToken, logout } from '../auth.api';

let mockAxios: MockAdapter;

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
      password: 'password123',
    };

    describe('성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(200, {
          data: {
            userInfo: { userId: 'testuser', nickname: 'Test User' },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          },
        });
      });

      it('로그인 응답을 반환한다', async () => {
        const result = await login(loginForm);

        expect(result).toEqual({
          userInfo: { userId: 'testuser', nickname: 'Test User' },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        });
      });
    });

    describe('실패 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(400, {
          error: {
            message: '로그인 실패',
            data: [{ field: 'userId', message: '아이디 또는 비밀번호가 잘못되었습니다' }],
          },
        });
      });

      it('에러를 throw한다', async () => {
        await expect(login(loginForm)).rejects.toThrow();
      });
    });
  });

  describe('join', () => {
    const joinForm = {
      userId: 'newuser',
      password: 'password123',
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

      it('에러를 throw한다', async () => {
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
        mockAxios.onPost('/auth/refresh').reply(200, {
          data: {
            userInfo: { userId: 'testuser', nickname: 'Test User' },
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        });
      });

      it('새로운 토큰을 반환한다', async () => {
        const result = await refreshToken(refreshTokenRequest);

        expect(result).toEqual({
          userInfo: { userId: 'testuser', nickname: 'Test User' },
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        });
      });
    });

    describe('실패 시', () => {
      describe('유효하지 않은 refreshToken인 경우', () => {
        beforeEach(() => {
          mockAxios.onPost('/auth/refresh').reply(401, {
            error: {
              message: 'Invalid refresh token',
            },
          });
        });

        it('에러를 throw한다', async () => {
          await expect(refreshToken(refreshTokenRequest)).rejects.toThrow();
        });
      });

      describe('만료된 refreshToken인 경우', () => {
        beforeEach(() => {
          mockAxios.onPost('/auth/refresh').reply(401, {
            error: {
              message: 'Refresh token expired',
            },
          });
        });

        it('에러를 throw한다', async () => {
          await expect(refreshToken(refreshTokenRequest)).rejects.toThrow();
        });
      });
    });
  });

  describe('logout', () => {
    describe('성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/logout').reply(200, {
          data: { message: 'Logged out successfully' },
        });
      });

      it('로그아웃 응답을 반환한다', async () => {
        const result = await logout();

        expect(result).toEqual({ message: 'Logged out successfully' });
      });
    });

    describe('실패 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/logout').reply(500, {
          error: {
            message: 'Server error',
          },
        });
      });

      it('로컬 로그아웃 메시지를 반환한다', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await logout();

        expect(result).toEqual({ message: 'Logged out locally' });
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
      });
    });

    describe('네트워크 오류 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/logout').networkError();
      });

      it('로컬 로그아웃 메시지를 반환한다', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await logout();

        expect(result).toEqual({ message: 'Logged out locally' });
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
      });
    });
  });
});
