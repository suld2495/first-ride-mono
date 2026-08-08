import { useCallback, useEffect, useRef } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';

import { type RequiredAppVersion } from '@/api/app-version.api';
import { useRequiredAppVersionQuery } from '@/hooks/useRequiredAppVersionQuery';
import { isBuildNumberLower } from '@/utils/app-version';
import { exitApp } from '@/utils/exit-app';

const UPDATE_ALERT_TITLE = '업데이트가 필요해요';

export const useForceUpdate = (
  installedBuildNumber: string | null,
  userId?: string,
  isPhysicalDevice: boolean = true,
): void => {
  const isCheckingRef = useRef(false);
  const isAlertVisibleRef = useRef(false);
  const canShowForceUpdate =
    Platform.OS === 'ios' &&
    isPhysicalDevice &&
    !!installedBuildNumber &&
    !!userId;
  const {
    data: storeVersion,
    isSuccess: isVersionLookupSuccessful,
    refetch,
  } = useRequiredAppVersionQuery(userId, canShowForceUpdate);

  const showUpdateAlert = useCallback((requiredVersion: RequiredAppVersion) => {
    if (isAlertVisibleRef.current) {
      return;
    }

    isAlertVisibleRef.current = true;

    Alert.alert(
      UPDATE_ALERT_TITLE,
      `더 안정적인 이용을 위해 최신 버전(빌드 ${requiredVersion.minimumBuildNumber})으로 업데이트해주세요.`,
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: exitApp,
        },
        {
          text: '업데이트 하러가기',
          onPress: () => {
            void Linking.openURL(requiredVersion.updateUrl);
          },
        },
      ],
      { cancelable: false },
    );
  }, []);

  useEffect(() => {
    if (
      canShowForceUpdate &&
      isVersionLookupSuccessful &&
      installedBuildNumber &&
      storeVersion &&
      isBuildNumberLower(installedBuildNumber, storeVersion.minimumBuildNumber)
    ) {
      showUpdateAlert(storeVersion);
    }
  }, [
    canShowForceUpdate,
    installedBuildNumber,
    isVersionLookupSuccessful,
    showUpdateAlert,
    storeVersion,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        if (canShowForceUpdate && !isCheckingRef.current) {
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
  }, [canShowForceUpdate, refetch]);
};
