import { User } from '@repo/types';
import { http, HttpResponse } from 'msw';

const BASE_URL = import.meta.env.VITE_MOCK_BASE_URL;

export const userHandlers = [
  http.get<object, object, User[]>(`${BASE_URL}/api/user`, async () => {
    return HttpResponse.json([
      {
        userId: 'yunji1',
        nickname: '윤지1',
      },
      {
        userId: 'yunji2',
        nickname: '윤지2',
      }, 
    ]);
  }),
];
