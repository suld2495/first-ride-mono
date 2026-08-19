import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  RANDOM_FRIEND_RECOMMENDATION_ENABLED_KEY_PREFIX,
  useRandomFriendRecommendationPreference,
} from '@/hooks/useRandomFriendRecommendationPreference';

const USER_ID = 'user-1';
const STORAGE_KEY = `${RANDOM_FRIEND_RECOMMENDATION_ENABLED_KEY_PREFIX}:${USER_ID}`;

describe('useRandomFriendRecommendationPreference', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    jest.clearAllMocks();
  });

  it('기기에 저장된 비활성화 상태를 복원한다', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'false');

    const { result } = renderHook(() =>
      useRandomFriendRecommendationPreference(USER_ID),
    );

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    expect(result.current.isEnabled).toBe(false);
  });

  it('토글 상태를 사용자별 기기 저장소에 저장한다', async () => {
    const { result } = renderHook(() =>
      useRandomFriendRecommendationPreference(USER_ID),
    );

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.setEnabled(false);
    });

    expect(result.current.isEnabled).toBe(false);
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'false');
    });
  });

  it('저장값이 없으면 기본값을 활성화로 사용한다', async () => {
    const { result } = renderHook(() =>
      useRandomFriendRecommendationPreference(USER_ID),
    );

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    expect(result.current.isEnabled).toBe(true);
  });

  it('기기 저장소를 읽지 못해도 기본값을 활성화로 사용한다', async () => {
    jest
      .spyOn(AsyncStorage, 'getItem')
      .mockRejectedValueOnce(new Error('storage unavailable'));

    const { result } = renderHook(() =>
      useRandomFriendRecommendationPreference(USER_ID),
    );

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    expect(result.current.isEnabled).toBe(true);
  });

  it('로그인 사용자가 없으면 기기 저장소에 기록하지 않는다', async () => {
    const { result } = renderHook(() =>
      useRandomFriendRecommendationPreference(undefined),
    );

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.setEnabled(false);
    });

    expect(result.current.isEnabled).toBe(false);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('기기 저장소에 쓰지 못해도 토글 상태는 유지한다', async () => {
    jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('storage unavailable'));

    const { result } = renderHook(() =>
      useRandomFriendRecommendationPreference(USER_ID),
    );

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    await act(async () => {
      result.current.setEnabled(false);
      await Promise.resolve();
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it('훅이 해제된 뒤 저장값이 도착해도 상태를 업데이트하지 않는다', async () => {
    let resolveGetItem: ((value: string | null) => void) | undefined;
    jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveGetItem = resolve;
        }),
    );

    const { unmount } = renderHook(() =>
      useRandomFriendRecommendationPreference(USER_ID),
    );

    unmount();

    await act(async () => {
      resolveGetItem?.('false');
      await Promise.resolve();
    });
  });
});
