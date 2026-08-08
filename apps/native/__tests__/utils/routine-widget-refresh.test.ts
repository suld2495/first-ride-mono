import * as routineApi from '@repo/shared/api/routine.api';
import * as statApi from '@repo/shared/api/stat.api';
import * as userApi from '@repo/shared/api/user.api';

import {
  refreshCharacterWidgetSnapshot,
  refreshRoutineWidgetSnapshot,
} from '@/utils/routine-widget-refresh';
import * as routineWidgetNative from '@/widget/routine-widget-native';

const routine = {
  routineId: 1,
  nickname: 'tester',
  routineName: '물 마시기',
  routineDetail: '',
  penalty: 0,
  weeklyCount: 0,
  routineCount: 3,
  mateNickname: '',
  isMe: true,
  startDate: '2026-05-25',
  successDate: [],
  paused: false,
  hidden: false,
  hasPendingConfirmation: false,
  pendingConfirmationCount: 0,
  pendingConfirmationIds: [],
  todayConfirmStatus: null,
  todayConfirmId: null,
  canRequestToday: true,
  photoRequired: false,
};

describe('refreshRoutineWidgetSnapshot', () => {
  beforeEach(() => {
    jest.spyOn(routineApi, 'fetchRoutines').mockResolvedValue([routine]);
    jest
      .spyOn(routineWidgetNative, 'saveRoutineWidgetSnapshot')
      .mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('현재 주 루틴을 조회해 위젯 스냅샷을 저장한다', async () => {
    await refreshRoutineWidgetSnapshot({
      nickname: 'tester',
      themeName: 'green',
      date: '2026-05-25',
    });

    expect(routineApi.fetchRoutines).toHaveBeenCalledWith('2026-05-25');
    expect(routineWidgetNative.saveRoutineWidgetSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ready',
        items: [expect.objectContaining({ title: '물 마시기' })],
      }),
    );
  });

  it('사용자와 스탯을 조회해 캐릭터 위젯 스냅샷을 저장한다', async () => {
    jest.spyOn(userApi, 'fetchMe').mockResolvedValue({
      userId: 'tester',
      nickname: '테스터',
      role: 'USER',
      motto: null,
      mottos: [],
      characterImageUrl: '/character.png',
      backgroundImageUrl: '/background.png',
    });
    jest.spyOn(statApi, 'fetchMyStats').mockResolvedValue({
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
    });
    jest
      .spyOn(routineWidgetNative, 'saveCharacterWidgetSnapshot')
      .mockResolvedValue();

    await refreshCharacterWidgetSnapshot({
      userId: 'tester',
      themeName: 'blue',
    });

    expect(userApi.fetchMe).toHaveBeenCalledTimes(1);
    expect(statApi.fetchMyStats).toHaveBeenCalledTimes(1);
    expect(
      routineWidgetNative.saveCharacterWidgetSnapshot,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ready',
        level: 4,
        currentExp: 6,
        expForNextLevel: 10,
      }),
    );
  });
});
