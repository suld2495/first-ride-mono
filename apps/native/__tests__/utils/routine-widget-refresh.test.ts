import * as routineApi from '@repo/shared/api/routine.api';

import { refreshRoutineWidgetSnapshot } from '@/utils/routine-widget-refresh';
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
});
