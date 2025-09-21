import { Friend } from '@repo/types';
import { http, HttpResponse } from 'msw';

const BASE_URL = import.meta.env.VITE_MOCK_BASE_URL;

export const friendsHandlers = [
  http.get<object, object, Friend[]>(`${BASE_URL}/api/friend`, async () => {
    return HttpResponse.json([
      {
        userId: 'yunji1',
        nickname: '윤지1',
        isFollowing: false,
      },
      {
        userId: 'yunji2',
        nickname: '윤지2',
        isFollowing: true,
      }, 
    ]);
  }),

  http.post<object, object>(`${BASE_URL}/api/friend/:id`, async () => {
    return HttpResponse.json(
      { status: 200 },
    );
  }),

  http.delete<object, object>(`${BASE_URL}/api/friend/:id`, async () => {
    return HttpResponse.json(
      { status: 200 },
    );
  }),
];
