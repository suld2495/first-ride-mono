import type { Routine } from '@repo/types';

import {
  createRoutineWidgetSnapshot,
  createSignedOutRoutineWidgetSnapshot,
} from '@/widget/routine-widget';

const createRoutine = (overrides: Partial<Routine>): Routine => ({
  routineId: 1,
  nickname: 'manna',
  routineName: '아침 스트레칭',
  routineDetail: '',
  penalty: 0,
  weeklyCount: 0,
  routineCount: 5,
  mateNickname: '',
  isMe: true,
  startDate: '2026-05-18',
  successDate: [],
  paused: false,
  hidden: false,
  ...overrides,
});

describe('routine widget snapshot', () => {
  it('로그인하지 않은 상태에서는 로그인 안내만 표시한다', () => {
    expect(createSignedOutRoutineWidgetSnapshot()).toEqual({
      status: 'signedOut',
      title: '이번 주 루틴',
      message: '로그인 해주세요',
      items: [],
      remainingCount: 0,
    });
  });

  it('오늘 미완료 루틴을 우선하고 주간 달성률이 낮은 순서로 정렬한다', () => {
    const snapshot = createRoutineWidgetSnapshot(
      [
        createRoutine({
          routineId: 1,
          routineName: '영어 공부',
          weeklyCount: 1,
          routineCount: 4,
        }),
        createRoutine({
          routineId: 2,
          routineName: '산책',
          weeklyCount: 1,
          routineCount: 2,
          successDate: ['260521'],
        }),
        createRoutine({
          routineId: 3,
          routineName: '운동',
          weeklyCount: 0,
          routineCount: 3,
        }),
        createRoutine({
          routineId: 4,
          routineName: '물 마시기',
          weeklyCount: 1,
          routineCount: 1,
          successDate: ['260521'],
        }),
      ],
      { maxItems: 4, today: new Date('2026-05-21T09:00:00+09:00') },
    );

    expect(snapshot.status).toBe('ready');
    expect(snapshot.items.map((item) => item.title)).toEqual([
      '운동',
      '영어 공부',
      '산책',
      '물 마시기',
    ]);
    expect(snapshot.items[2]).toMatchObject({
      title: '산책',
      isTodayDone: true,
    });
  });

  it('작은 위젯에 맞게 최대 표시 개수와 추가 개수를 계산한다', () => {
    const routines = Array.from({ length: 6 }, (_, index) =>
      createRoutine({
        routineId: index + 1,
        routineName: `루틴 ${index + 1}`,
        weeklyCount: 0,
        routineCount: 3,
      }),
    );

    const snapshot = createRoutineWidgetSnapshot(routines, {
      today: new Date('2026-05-21T09:00:00+09:00'),
    });

    expect(snapshot.items).toHaveLength(3);
    expect(snapshot.remainingCount).toBe(3);
  });
});
