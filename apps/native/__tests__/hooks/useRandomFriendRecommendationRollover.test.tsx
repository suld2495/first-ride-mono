import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { useRandomFriendRecommendationRollover } from '@/hooks/useRandomFriendRecommendationRollover';

describe('useRandomFriendRecommendationRollover', () => {
  let appStateChangeHandler: ((state: AppStateStatus) => void) | undefined;

  beforeEach(() => {
    appStateChangeHandler = undefined;
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, handler) => {
        appStateChangeHandler = handler;

        return { remove: jest.fn() };
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('백그라운드에서 자정을 지난 뒤 active로 돌아오면 refetch를 한 번 호출한다', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-12T23:59:00.000'));
    const refetch = jest.fn();

    renderHook(() => useRandomFriendRecommendationRollover(refetch));

    act(() => {
      appStateChangeHandler?.('background');
      jest.setSystemTime(new Date('2026-08-13T00:00:03.000'));
      appStateChangeHandler?.('active');
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
