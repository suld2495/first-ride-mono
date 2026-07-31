import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';
import RNExitApp from 'react-native-exit-app';

import {
  fetchLatestAppStoreVersion,
  type AppStoreVersion,
} from '@/api/app-store-version.api';
import { isVersionLower } from '@/utils/app-version';

const UPDATE_ALERT_TITLE = '업데이트가 필요해요';
const appVersionKeys = {
  store: () => ['app-version', 'store'] as const,
};

export const useForceUpdate = (installedVersion: string | null): void => {
  const isCheckingRef = useRef(false);
  const isAlertVisibleRef = useRef(false);
  const isEnabled = Platform.OS === 'ios' && !!installedVersion;
  const {
    data: storeVersion,
    error,
    refetch,
  } = useQuery({
    queryKey: appVersionKeys.store(),
    queryFn: () => fetchLatestAppStoreVersion(),
    enabled: isEnabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const showUpdateAlert = useCallback((latestVersion: AppStoreVersion) => {
    if (isAlertVisibleRef.current) {
      return;
    }

    isAlertVisibleRef.current = true;

    Alert.alert(
      UPDATE_ALERT_TITLE,
      `더 안정적인 이용을 위해 최신 버전(${latestVersion.version})으로 업데이트해주세요.`,
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => RNExitApp.exitApp(),
        },
        {
          text: '업데이트 하러가기',
          onPress: () => {
            void Linking.openURL(latestVersion.storeUrl);
          },
        },
      ],
      { cancelable: false },
    );
  }, []);

  useEffect(() => {
    if (
      installedVersion &&
      storeVersion &&
      isVersionLower(installedVersion, storeVersion.version)
    ) {
      showUpdateAlert(storeVersion);
    }
  }, [installedVersion, showUpdateAlert, storeVersion]);

  useEffect(() => {
    if (error) {
      console.error('[AppVersion] App Store lookup failed', error);
    }
  }, [error]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        if (isEnabled && !isCheckingRef.current) {
          isCheckingRef.current = true;
          void refetch().finally(() => {
            isCheckingRef.current = false;
          });
        }
        return;
      }

      isAlertVisibleRef.current = false;
    });

    return () => subscription?.remove();
  }, [isEnabled, refetch]);
};
