import type { Routine } from '@repo/types';

import { appThemes } from '@/theme/themes';
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
      { today: new Date('2026-05-21T09:00:00+09:00') },
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

  it('위젯 높이에 맞춰 자를 수 있도록 정렬된 전체 루틴을 전달한다', () => {
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

    expect(snapshot.items).toHaveLength(6);
    expect(snapshot.remainingCount).toBe(0);
  });

  it('선택한 테마의 횟수 라벨 색상을 전달한다', () => {
    const snapshot = createRoutineWidgetSnapshot(
      [
        createRoutine({
          routineId: 1,
          routineName: '물 마시기',
        }),
      ],
      {
        themeName: 'green',
      },
    );

    expect(snapshot).toMatchObject({
      countLabelStyle: {
        backgroundColor: appThemes.green.colors.brand.todaySuccessCheckbox,
        textColor: appThemes.green.colors.brand.todaySuccessCheck,
        darkBackgroundColor: '#416B58',
        darkTextColor: '#AFEACB',
      },
    });
  });

  it('다크 테마의 횟수 라벨 색상은 어두운 배경과 밝은 텍스트를 전달한다', () => {
    const snapshot = createRoutineWidgetSnapshot(
      [
        createRoutine({
          routineId: 1,
          routineName: '물 마시기',
        }),
      ],
      {
        themeName: 'dark',
      },
    );

    expect(snapshot).toMatchObject({
      countLabelStyle: {
        backgroundColor: appThemes.dark.colors.brand.todaySuccessCheckbox,
        textColor: appThemes.dark.colors.brand.todaySuccessCheck,
        darkBackgroundColor: '#1565C0',
        darkTextColor: '#BBDEFB',
      },
    });
  });
});
