import { fetchLevelUpStatus } from '@repo/shared/api/level-up.api';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import LevelProgressCelebrationModal from '@/components/modal/level-progress-celebration-modal';
import { useAuthUser } from '@/hooks/useAuthSession';
import type { LevelUpStatusCelebration } from '@/utils/level-progress-celebration';

interface LevelUpStatusContextValue {
  checkLevelUpStatus: () => Promise<void>;
}

const noopCheckLevelUpStatus = async (): Promise<void> => undefined;

const LevelUpStatusContext = createContext<LevelUpStatusContextValue>({
  checkLevelUpStatus: noopCheckLevelUpStatus,
});

export const LevelUpStatusProvider = ({ children }: PropsWithChildren) => {
  const user = useAuthUser();
  const { data: currentUser } = useFetchMeQuery(user?.userId);
  const [celebration, setCelebration] =
    useState<LevelUpStatusCelebration | null>(null);
  const inFlightRequestRef = useRef<Promise<void> | null>(null);
  const activeUserIdRef = useRef<string | undefined>(user?.userId);

  useEffect(() => {
    activeUserIdRef.current = user?.userId;

    if (!user?.userId) {
      setCelebration(null);
    }
  }, [user?.userId]);

  const checkLevelUpStatus = useCallback(async (): Promise<void> => {
    const requestedUserId = user?.userId;

    if (!requestedUserId) {
      return;
    }

    if (inFlightRequestRef.current) {
      return inFlightRequestRef.current;
    }

    const request = (async () => {
      try {
        const status = await fetchLevelUpStatus();

        if (
          !status.hasLevelUp ||
          !Number.isInteger(status.currentLevel) ||
          status.currentLevel < 1 ||
          activeUserIdRef.current !== requestedUserId
        ) {
          return;
        }

        setCelebration({
          type: 'level-up-status',
          currentLevel: status.currentLevel,
        });
      } catch {
        // 상태 확인은 다음 호출 시 재시도할 수 있도록 조용히 실패시킨다.
      }
    })();

    inFlightRequestRef.current = request;

    try {
      await request;
    } finally {
      if (inFlightRequestRef.current === request) {
        inFlightRequestRef.current = null;
      }
    }
  }, [user?.userId]);

  const handleClose = useCallback(() => {
    setCelebration(null);
  }, []);

  const value = useMemo<LevelUpStatusContextValue>(
    () => ({ checkLevelUpStatus }),
    [checkLevelUpStatus],
  );

  return (
    <LevelUpStatusContext.Provider value={value}>
      {children}
      <LevelProgressCelebrationModal
        celebration={celebration}
        characterImageUrl={
          currentUser?.characterImageUrl ?? user?.characterImageUrl
        }
        onClose={handleClose}
      />
    </LevelUpStatusContext.Provider>
  );
};

export const useLevelUpStatus = (): LevelUpStatusContextValue =>
  useContext(LevelUpStatusContext);
