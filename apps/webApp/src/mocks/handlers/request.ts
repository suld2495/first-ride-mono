import { http, HttpResponse } from 'msw';

const BASE_URL = import.meta.env.VITE_MOCK_BASE_URL;

export const requestHandlers = [
  http.get(`${BASE_URL}/api/routine/confirm/list`, () => {
    return HttpResponse.json([
      {
        id: 1,
        routineId: 1,
        requesterNickname: 'moon',
        routineName: '퇴근 후 공부 루틴',
        createdAt: '2025-04-11T20:01:16.368486',
      },
      {
        id: 2,
        routineId: 2,
        requesterNickname: 'moon',
        routineName: '퇴근 후 공부 루틴',
        createdAt: '2025-04-11T20:01:16.368486',
      },
    ]);
  }),
  http.get(`${BASE_URL}/api/routine/confirm/:id`, () => {
    return HttpResponse.json({
      id: 1,
      requesterNickname: 'moon',
      routineName: '퇴근 후 공부 루틴',
      routineDetail: '일주일 3회 이상 퇴근 후 공부하고 인증사진 보내기',
      imagePath: 'https://example.com/images/image.jpg',
      createdAt: '2025-04-11T20:01:16.368486',
    });
  }),

  http.post(`${BASE_URL}/api/routine/confirm`, async () => {
    return HttpResponse.json(
      { message: '인증 요청이 완료되었습니다.' },
      { status: 201 },
    );
  }),
];
