import { User } from '@repo/types';
import { http, HttpResponse } from 'msw';

const BASE_URL = import.meta.env.VITE_MOCK_BASE_URL;

export const userHandlers = [
  http.get<object, object, User[]>(`${BASE_URL}/api/users/search`, async () => {
    return HttpResponse.json([
      {
        userId: 'yun1',
        nickname: '윤1',
      },
      {
        userId: 'yun2',
        nickname: '윤2',
      }, 
    ]);
  }),
];
