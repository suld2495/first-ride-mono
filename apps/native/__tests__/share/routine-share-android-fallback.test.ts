jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: {
    OS: 'android',
  },
}));

import {
  clearPendingRoutineShare,
  clearRoutineShareTargets,
  getPendingRoutineShare,
  syncRoutineShareTargets,
} from '@/share/routine-share';

describe('routine share Android fallback', () => {
  beforeEach(() => {
    delete process.env.EXPO_OS;
  });

  it('stays safe before the generated native module is available', async () => {
    await expect(syncRoutineShareTargets([])).resolves.toBeUndefined();
    await expect(clearRoutineShareTargets()).resolves.toBeUndefined();
    await expect(getPendingRoutineShare()).resolves.toBeNull();
    await expect(clearPendingRoutineShare()).resolves.toBeUndefined();
  });
});
