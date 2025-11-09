import { Friend, FriendRequestResponse } from '@repo/types';
import { http, HttpResponse } from 'msw';

const BASE_URL = `${import.meta.env.VITE_MOCK_BASE_URL}/api/friends`;

export const friendsHandlers = [
  http.get<object, object, Friend[]>(`${BASE_URL}`, async () => {
    return HttpResponse.json<Friend[]>([
      {
        nickname: '윤1',
        job: '개발자',
        profileImage: '',
        friendSince: '',
      },
      {
        nickname: '윤2',
        job: '개발자',
        profileImage: '',
        friendSince: '',
      },
    ]);
  }),

  // 친구 요청
  http.post<object, object>(`${BASE_URL}/requests`, async () => {
    return HttpResponse.json({ status: 200 });
  }),

  // 친구 삭제
  http.delete<object, object>(`${BASE_URL}/:id`, async () => {
    return HttpResponse.json({ status: 200 });
  }),

  // 친구 요청 리스트
  http.get<object, object, FriendRequestResponse[]>(
    `${BASE_URL}/requests`,
    async () => {
      return HttpResponse.json<FriendRequestResponse[]>([
        {
          id: 1,
          senderNickname: 'yun2',
          receiverNickname: '문11',
          status: 'PENDING',
          createdAt: '2025-09-24T00:18:14.047589',
        },
        {
          id: 2,
          senderNickname: 'yun12',
          receiverNickname: '문11',
          status: 'PENDING',
          createdAt: '2025-09-24T00:18:14.047589',
        },
      ]);
    },
  ),

  // 친구 승인
  http.post<object, object>(
    `${BASE_URL}/requests/:requestId/accept`,
    async () => {
      return HttpResponse.json({ status: 200 });
    },
  ),

  // 친구 거절
  http.post<object, object>(
    `${BASE_URL}/requests/:requestId/reject`,
    async () => {
      return HttpResponse.json({ status: 200 });
    },
  ),
];
