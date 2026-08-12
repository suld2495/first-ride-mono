import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  getLocalDateKey,
  getMillisecondsUntilNextMidnight,
  getSecondsUntilNextMidnight,
} from '@/utils/random-friend-recommendation-timer';

type RefetchRecommendation = () => unknown;

export const useRandomFriendRecommendationRollover = (
  refetch: RefetchRecommendation,
): number => {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [initialDateKey] = useState(() => getLocalDateKey(new Date()));
  const lastRefreshDateRef = useRef(initialDateKey);
  const refetchRef = useRef(refetch);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getSecondsUntilNextMidnight(new Date()),
  );

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  const updateCountdown = useCallback(() => {
    setRemainingSeconds(getSecondsUntilNextMidnight(new Date()));
  }, []);

  const refreshRecommendationIfNewDay = useCallback(() => {
    const now = new Date();
    const currentDateKey = getLocalDateKey(now);

    setRemainingSeconds(getSecondsUntilNextMidnight(now));

    if (lastRefreshDateRef.current === currentDateKey) {
      return;
    }

    lastRefreshDateRef.current = currentDateKey;
    void refetchRef.current();
  }, []);

  useEffect(() => {
    let rolloverTimer: ReturnType<typeof setTimeout>;

    const scheduleNextRollover = () => {
      rolloverTimer = setTimeout(() => {
        refreshRecommendationIfNewDay();
        scheduleNextRollover();
      }, getMillisecondsUntilNextMidnight(new Date()));
    };

    updateCountdown();
    scheduleNextRollover();
    const countdownTimer = setInterval(updateCountdown, 1000);

    return () => {
      clearTimeout(rolloverTimer);
      clearInterval(countdownTimer);
    };
  }, [refreshRecommendationIfNewDay, updateCountdown]);

  useEffect(() => {
    appStateRef.current = AppState.currentState;

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      const returnedToActive =
        (previousState === 'inactive' || previousState === 'background') &&
        nextState === 'active';

      if (returnedToActive) {
        refreshRecommendationIfNewDay();
      }

      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [refreshRecommendationIfNewDay]);

  return remainingSeconds;
};
