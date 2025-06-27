import { http, HttpResponse } from 'msw';

import { RoutineForm } from '@/api/routine.api';
import { getWeekMonday } from '@/utils/date-utils';

const BASE_URL = import.meta.env.VITE_MOCK_BASE_URL;

export const routineHandlers = [
  http.get(`${BASE_URL}/api/routine/list`, ({ request }) => {
    const searchParams = new URLSearchParams(request.url.split('?')[1]);
    const date = searchParams.get('date');

    if (date === getWeekMonday(new Date())) {
      return HttpResponse.json([
        {
          routineId: 1,
          nickname: 'yunji',
          routineName: '퇴근 후 공부 루틴',
          endDate: '2025-04-30',
          routineDetail: '일주일 3회 이상 퇴근 후 공부하고 인증사진 보내기',
          penalty: 5000,
          routineCount: 3,
          weeklyCount: 1,
          mateNickname: 'moon',
        },
        {
          routineId: 2,
          nickname: 'yunji',
          routineName: '퇴근 후 공부 루틴',
          endDate: '2025-04-30',
          routineDetail: '일주일 3회 이상 퇴근 후 공부하고 인증사진 보내기',
          penalty: 5000,
          routineCount: 3,
          weeklyCount: 4,
          mateNickname: 'moon',
        },
      ]);
    } else {
      return HttpResponse.json([
        {
          routineId: 3,
          nickname: 'yunji',
          routineName: '퇴근 후 공부 루틴',
          endDate: '2025-04-30',
          routineDetail: '일주일 3회 이상 퇴근 후 공부하고 인증사진 보내기',
          penalty: 5000,
          routineCount: 3,
          weeklyCount: 1,
          mateNickname: 'moon',
        },
      ]);
    }
  }),

  http.get(`${BASE_URL}/api/routine/details`, ({ request }) => {
    const searchParams = new URLSearchParams(request.url.split('?')[1]);
    const id = searchParams.get('routineId');

    if (!id) {
      return HttpResponse.json(
        { message: '루틴 ID를 입력해주세요.' },
        { status: 400 },
      );
    }
    return HttpResponse.json({
      routineId: 1,
      nickname: 'yunji',
      routineName: '퇴근 후 공부 루틴',
      startDate: '2025-04-15',
      endDate: '2025-04-30',
      routineDetail: '일주일 3회 이상 퇴근 후 공부하고 인증사진 보내기',
      penalty: 5000,
      routineCount: 3,
      mateNickname: 'moon',
    });
  }),

  http.post(`${BASE_URL}/api/routine`, async ({ request }) => {
    const {
      nickname,
      routineName,
      startDate,
      routineDetail,
      penalty,
      routineCount,
    } = (await request.json()) as RoutineForm;

    if (
      !nickname ||
      !routineName ||
      !startDate ||
      !routineDetail ||
      !penalty ||
      !routineCount
    ) {
      return HttpResponse.json(
        { message: '모든 필드를 입력해주세요.' },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { message: '루틴이 생성되었습니다.' },
      { status: 201 },
    );
  }),
];
