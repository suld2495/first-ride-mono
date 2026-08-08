import type { Routine } from '@repo/types';

const mockExtensionStorage = {
  set: jest.fn(),
  get: jest.fn(),
  remove: jest.fn(),
};
jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('@bacons/apple-targets', () => ({
  ExtensionStorage: jest.fn().mockImplementation(() => mockExtensionStorage),
}));

import {
  clearPendingRoutineShare,
  clearRoutineShareTargets,
  getPendingRoutineShare,
  LEGACY_ROUTINE_SHARE_TARGETS_KEY,
  PENDING_ROUTINE_SHARE_KEY,
  ROUTINE_SHARE_TARGETS_KEY,
  syncRoutineShareTargets,
} from '@/share/routine-share';

const createRoutine = (id: number): Routine => ({
  routineId: id,
  nickname: 'testuser',
  routineName: `루틴 ${id}`,
  routineDetail: `${id} 상세`,
  penalty: 0,
  weeklyCount: 0,
  routineCount: 3,
  mateNickname: 'mate',
  isMe: false,
  startDate: '2026-05-25',
  confirmations: [],
  paused: false,
  hidden: false,
  hasPendingConfirmation: false,
  pendingConfirmationCount: 0,
  pendingConfirmationIds: [],
  todayConfirmStatus: null,
  todayConfirmId: null,
  canRequestToday: true,
  photoRequired: true,
});

describe('routine share native bridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('publishes every routine to iOS extension storage', async () => {
    const routines = Array.from({ length: 12 }, (_, index) =>
      createRoutine(index + 1),
    );

    await syncRoutineShareTargets(routines);

    const [, payloadJson] = mockExtensionStorage.set.mock.calls[0] as [
      string,
      string,
    ];
    const payload = JSON.parse(payloadJson) as { targets: unknown[] };

    expect(mockExtensionStorage.set).toHaveBeenCalledWith(
      ROUTINE_SHARE_TARGETS_KEY,
      expect.any(String),
    );
    expect(payload.targets).toHaveLength(12);
    expect(mockExtensionStorage.remove).toHaveBeenCalledWith(
      LEGACY_ROUTINE_SHARE_TARGETS_KEY,
    );
  });

  it('clears stored share state when signing out', async () => {
    await clearRoutineShareTargets();

    const [, payloadJson] = mockExtensionStorage.set.mock.calls[0] as [
      string,
      string,
    ];

    expect(JSON.parse(payloadJson)).toMatchObject({
      status: 'signedOut',
      targets: [],
    });
    expect(mockExtensionStorage.remove).toHaveBeenCalledWith(
      LEGACY_ROUTINE_SHARE_TARGETS_KEY,
    );
    expect(mockExtensionStorage.remove).toHaveBeenCalledWith(
      PENDING_ROUTINE_SHARE_KEY,
    );
  });

  it('loads and clears the pending share for the matching session', async () => {
    mockExtensionStorage.get.mockReturnValue(
      JSON.stringify({
        sessionId: 'session-1',
        routineId: 1,
        createdAt: '2026-08-03T00:00:00.000Z',
        images: [{ uri: 'file:///shared.jpg' }],
      }),
    );

    await expect(getPendingRoutineShare('session-1')).resolves.toMatchObject({
      sessionId: 'session-1',
      routineId: 1,
    });
    await clearPendingRoutineShare('session-1');

    expect(mockExtensionStorage.remove).toHaveBeenCalledWith(
      PENDING_ROUTINE_SHARE_KEY,
    );
  });
});
