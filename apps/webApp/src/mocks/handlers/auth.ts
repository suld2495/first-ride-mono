import { AuthForm, AuthResponse, JoinForm } from '@repo/types';
import { http, HttpResponse } from 'msw';

const BASE_URL = import.meta.env.VITE_MOCK_BASE_URL;

export const authHandlers = [
  http.post<object, AuthForm>(`${BASE_URL}/api/auth/login`, async ({ request }) => {
    const user = {
      userId: 'admin',
      password: 'admin',
    };
    const { userId, password } = await request.json();

    if (!userId || !password || user.userId !== userId || user.password !== password) {
      return HttpResponse.json(
        {
          message: "아이디 또는 비밀번호가 일치하지 않습니다.",
          error: "INVALID_CREDENTIALS"
        },
        { status: 401 },
      );
    }

    const response: AuthResponse = {
      accessToken: 'accessToken',
      userInfo: {
        userId: 'moon',
        nickname: '용사',
      },
    };

    return HttpResponse.json(response);
  }),

  http.post<object, JoinForm>(`${BASE_URL}/api/auth/login`, async ({ request }) => {
    const { userId, password, nickname } = await request.json();

    if (userId.length < 4 || 60 < userId.length) {
      return HttpResponse.json(
        {
          rejected: nickname,
          message: "size must be between 4 and 60",
          field: "userId"
        },
        { status: 400 },
      );
    }


    if (nickname.length < 2 || 40 < nickname.length) {
      return HttpResponse.json(
        {
          rejected: nickname,
          message: "size must be between 2 and 40",
          field: "nickname"
        },
        { status: 400 },
      );
    }

    if (password.length < 8 || 100 < password.length) {
      return HttpResponse.json(
        {
          message: "크기가 8에서 100 사이여야 합니다",
          rejected: password,
          field: "password"
        },
        { status: 400 },
      );
    }

    return HttpResponse.json("성공");
  }),
];
