import type { Routine } from '@repo/types';

import { DEFAULT_ROUTINE_COLOR } from '@/constants/ROUTINE_COLORS';
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
  hasPendingConfirmation: false,
  pendingConfirmationCount: 0,
  pendingConfirmationIds: [],
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

  it('기본 위젯 항목은 API 조회 순서를 유지한다', () => {
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
          weeklyCount: 1,
          routineCount: 3,
          paused: true,
        }),
        createRoutine({
          routineId: 4,
          routineName: '물 마시기',
          weeklyCount: 1,
          routineCount: 1,
          successDate: ['260521'],
          hidden: true,
        }),
      ],
      { today: new Date('2026-05-21T09:00:00+09:00') },
    );

    expect(snapshot.status).toBe('ready');
    expect(snapshot.items.map((item) => item.title)).toEqual([
      '영어 공부',
      '산책',
      '운동',
      '물 마시기',
    ]);
  });

  it('작은 위젯 항목은 오늘 미완료 루틴을 먼저 보여주고 API 조회 순서를 유지한다', () => {
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
    if (snapshot.status !== 'ready') {
      throw new Error('ready snapshot expected');
    }

    expect(snapshot.smallItems.map((item) => item.title)).toEqual([
      '영어 공부',
      '운동',
      '산책',
      '물 마시기',
    ]);
  });

  it('위젯 높이에 맞춰 자를 수 있도록 전체 루틴을 전달한다', () => {
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

  it('앱 실행 없이 위젯이 날짜 기준 완료 여부를 다시 계산할 수 있도록 완료 날짜를 전달한다', () => {
    const snapshot = createRoutineWidgetSnapshot(
      [
        createRoutine({
          routineId: 1,
          routineName: '명상',
          successDate: ['260521'],
        }),
      ],
      { today: new Date('2026-05-21T09:00:00+09:00') },
    );

    expect(snapshot.items[0]).toMatchObject({
      title: '명상',
      successDate: ['260521'],
      isTodayDone: true,
    });
  });

  it('API의 6자리 날짜 키로 한 자리 일자 완료 여부를 계산한다', () => {
    const snapshot = createRoutineWidgetSnapshot(
      [
        createRoutine({
          routineId: 1,
          routineName: '독서하기',
          successDate: ['260604'],
        }),
      ],
      { today: new Date('2026-06-04T09:00:00+09:00') },
    );

    expect(snapshot.items[0]).toMatchObject({
      title: '독서하기',
      successDate: ['260604'],
      isTodayDone: true,
    });
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

  it('루틴에 저장된 팔레트 컬러를 주간 현황 색상으로 전달한다', () => {
    const snapshot = createRoutineWidgetSnapshot(
      [
        createRoutine({
          routineId: 1,
          routineName: '영어 공부',
          weeklyCount: 1,
          routineCount: 4,
          symbolColor: '#00B8F0',
        }),
        createRoutine({
          routineId: 2,
          routineName: '운동',
          weeklyCount: 0,
          routineCount: 3,
          symbolColor: '#FA4F9B',
        }),
      ],
      { today: new Date('2026-05-21T09:00:00+09:00') },
    );

    expect(snapshot.items.map((item) => item.title)).toEqual([
      '영어 공부',
      '운동',
    ]);
    expect(snapshot.items[0]).toMatchObject({
      accentColor: '#00B8F0',
      darkAccentColor: '#00B8F0',
    });
    expect(snapshot.items[1]).toMatchObject({
      accentColor: '#FA4F9B',
      darkAccentColor: '#FA4F9B',
    });
  });

  it('저장된 컬러가 없으면 기본 루틴 팔레트 컬러를 전달한다', () => {
    const snapshot = createRoutineWidgetSnapshot([
      createRoutine({
        routineId: 1,
        routineName: '명상',
        symbolColor: undefined,
      }),
    ]);

    expect(snapshot.items[0]).toMatchObject({
      accentColor: DEFAULT_ROUTINE_COLOR,
      darkAccentColor: DEFAULT_ROUTINE_COLOR,
    });
  });
});
