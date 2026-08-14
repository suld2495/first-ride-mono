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
});
