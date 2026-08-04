import type { Routine, StatResponse, User } from '@repo/types';

import { DEFAULT_ROUTINE_COLOR } from '@/constants/ROUTINE_COLORS';
import { appThemes } from '@/theme/themes';
import {
  createCharacterWidgetSnapshot,
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
  todayConfirmStatus: overrides.todayConfirmStatus ?? null,
  todayConfirmId: overrides.todayConfirmId ?? null,
  canRequestToday: overrides.canRequestToday ?? true,
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
          symbolColor: '#30C2F1',
        }),
        createRoutine({
          routineId: 2,
          routineName: '운동',
          weeklyCount: 0,
          routineCount: 3,
          symbolColor: '#F791DE',
        }),
      ],
      { today: new Date('2026-05-21T09:00:00+09:00') },
    );

    expect(snapshot.items.map((item) => item.title)).toEqual([
      '영어 공부',
      '운동',
    ]);
    expect(snapshot.items[0]).toMatchObject({
      accentColor: '#30C2F1',
      darkAccentColor: '#30C2F1',
    });
    expect(snapshot.items[1]).toMatchObject({
      accentColor: '#F791DE',
      darkAccentColor: '#F791DE',
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

describe('character widget snapshot', () => {
  it('캐릭터와 배경 URL, 레벨, 경험치를 위젯 데이터로 변환한다', () => {
    const user: User = {
      userId: 'tester',
      nickname: '테스터',
      role: 'USER',
      motto: null,
      mottos: [],
      jobType: 'MAGE',
      characterImageUrl: '/assets/characters/mage_female_beginner.png',
      backgroundImageUrl: 'https://cdn.example.com/background.png',
    };
    const stats: StatResponse = {
      userId: 1,
      nickname: '테스터',
      currentLevel: 4,
      currentTotalExp: 26,
      currentLevelProgress: 6,
      expForNextLevel: 10,
      stats: {
        strength: 1,
        agility: 1,
        intelligence: 1,
        luck: 1,
        vitality: 1,
        mana: 1,
      },
      availablePoints: 0,
      totalPointsEarned: 0,
      totalPointsUsed: 0,
    };

    expect(
      createCharacterWidgetSnapshot(user, stats, {
        assetHost: 'https://api.irura.uk/',
        now: new Date('2026-08-03T10:00:00.000Z'),
        themeName: 'blue',
      }),
    ).toEqual({
      status: 'ready',
      level: 4,
      currentExp: 6,
      expForNextLevel: 10,
      characterImageUrl:
        'https://api.irura.uk/assets/characters/mage_female_beginner.png',
      backgroundImageUrl: 'https://cdn.example.com/background.png',
      generatedAt: '2026-08-03T10:00:00.000Z',
      levelBadgeStyle: {
        backgroundColor: appThemes.blue.colors.brand.text,
        textColor: appThemes.blue.colors.brand.background,
      },
      experienceStyle: {
        primaryColor: appThemes.red.colors.brand.icon,
        trackColor: appThemes.red.colors.brand.secondary,
        textColor: appThemes.red.colors.brand.routineBorder,
      },
    });
  });

  it.each([
    ['MAGE', 'red'],
    ['WARRIOR', 'blue'],
    ['ARCHER', 'green'],
  ] as const)(
    '%s 캐릭터의 경험치 말풍선에 %s 계열 컬러를 전달한다',
    (jobType, themeName) => {
      const user = {
        userId: 'tester',
        nickname: '테스터',
        role: 'USER',
        motto: null,
        mottos: [],
        jobType,
      } satisfies User;
      const stats = {
        currentLevel: 4,
        currentLevelProgress: 6,
        expForNextLevel: 10,
      } as StatResponse;
      const theme = appThemes[themeName];

      expect(createCharacterWidgetSnapshot(user, stats)).toMatchObject({
        experienceStyle: {
          primaryColor: theme.colors.brand.icon,
          trackColor: theme.colors.brand.secondary,
          textColor: theme.colors.brand.routineBorder,
        },
      });
    },
  );

  it('경험치 범위를 벗어난 API 값은 위젯에서 안전한 범위로 보정한다', () => {
    const user = {
      userId: 'tester',
      nickname: '테스터',
      role: 'USER',
      motto: null,
      mottos: [],
    } satisfies User;
    const stats = {
      currentLevel: 0,
      currentLevelProgress: 15,
      expForNextLevel: 10,
    } as StatResponse;

    expect(createCharacterWidgetSnapshot(user, stats)).toMatchObject({
      level: 1,
      currentExp: 10,
      expForNextLevel: 10,
      characterImageUrl: null,
      backgroundImageUrl: null,
    });
  });
});
