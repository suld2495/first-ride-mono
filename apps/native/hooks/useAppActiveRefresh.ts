import * as requestApi from '@repo/shared/api/request.api';
import * as routineApi from '@repo/shared/api/routine.api';
import { requestKey } from '@repo/shared/types/query-keys/request';
import { routineKeys } from '@repo/shared/types/query-keys/routine';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { ThemeName } from '@/theme/themes';
import { refreshRoutineWidgetSnapshot } from '@/utils/routine-widget-refresh';

const wasInactive = (appState: AppStateStatus) =>
  appState === 'inactive' || appState === 'background';

export const useAppActiveRefresh = (
  nickname: string,
  themeName?: ThemeName,
) => {
  const queryClient = useQueryClient();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!nickname) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;

      if (wasInactive(previousState) && nextState === 'active') {
        void queryClient.fetchQuery({
          queryKey: requestKey.receivedList(nickname),
          queryFn: requestApi.fetchReceivedRequests,
        });

        void queryClient.fetchQuery({
          queryKey: routineKeys.receivedChangeRequests(nickname),
          queryFn: routineApi.fetchReceivedRoutineChangeRequests,
        });

        void queryClient.invalidateQueries({
          queryKey: routineKeys.list(nickname),
        });

        void refreshRoutineWidgetSnapshot({
          nickname,
          themeName,
          queryClient,
        });
      }

      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [nickname, queryClient, themeName]);
};
