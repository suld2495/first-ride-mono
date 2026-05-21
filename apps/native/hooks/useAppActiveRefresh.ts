import * as requestApi from '@repo/shared/api/request.api';
import { requestKey } from '@repo/shared/types/query-keys/request';
import { routineKey } from '@repo/shared/types/query-keys/routine';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

const isRoutinePage = (pathname: string) => pathname.includes('routine');
const wasInactive = (appState: AppStateStatus) =>
  appState === 'inactive' || appState === 'background';

export const useAppActiveRefresh = (nickname: string) => {
  const pathname = usePathname();
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

        if (isRoutinePage(pathname)) {
          void queryClient.invalidateQueries({
            queryKey: routineKey.list(nickname),
          });
        }
      }

      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [nickname, pathname, queryClient]);
};
