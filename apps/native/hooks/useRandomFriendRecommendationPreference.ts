import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export const RANDOM_FRIEND_RECOMMENDATION_ENABLED_KEY_PREFIX =
  'friend-random-recommendation-enabled';

const getStorageKey = (userId: string) =>
  `${RANDOM_FRIEND_RECOMMENDATION_ENABLED_KEY_PREFIX}:${userId}`;

export const useRandomFriendRecommendationPreference = (
  userId: string | null | undefined,
) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsEnabled(true);
    setIsHydrated(false);

    if (!userId) {
      setIsHydrated(true);

      return () => {
        isMounted = false;
      };
    }

    const restorePreference = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(getStorageKey(userId));

        if (isMounted) {
          setIsEnabled(storedValue !== 'false');
          setIsHydrated(true);
        }
      } catch {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void restorePreference();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const setEnabled = useCallback(
    (enabled: boolean) => {
      setIsEnabled(enabled);

      if (!userId) {
        return;
      }

      void AsyncStorage.setItem(getStorageKey(userId), String(enabled)).catch(
        () => undefined,
      );
    },
    [userId],
  );

  return {
    isEnabled,
    isHydrated,
    setEnabled,
  };
};
