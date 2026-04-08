import { recordVisit } from '@repo/shared/api/quest.api';
import { questKeys } from '@repo/shared/types/query-keys/quest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

const getToday = () => new Date().toDateString();

const getMsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};

export const useVisitCheck = (enabled: boolean) => {
  const lastCallDate = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: recordVisit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: questKeys.lists() });
    },
    onError: () => {},
  });

  useEffect(() => {
    if (!enabled) {
      lastCallDate.current = null;
      return;
    }

    const callVisit = () => {
      const today = getToday();
      if (lastCallDate.current === today) return;
      lastCallDate.current = today;
      mutate();
    };

    // 1. 마운트 시 즉시 호출
    callVisit();

    // 2. 백그라운드 → 포그라운드 전환 시
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        callVisit();
      }
    });

    // 3. 자정 타이머
    let midnightTimer: ReturnType<typeof setTimeout>;

    const scheduleMidnight = () => {
      midnightTimer = setTimeout(() => {
        callVisit();
        scheduleMidnight();
      }, getMsUntilMidnight());
    };

    scheduleMidnight();

    return () => {
      subscription.remove();
      clearTimeout(midnightTimer);
    };
  }, [enabled, mutate]);
};
