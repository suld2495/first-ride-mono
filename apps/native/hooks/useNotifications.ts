import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type {
  NotificationHandlers,
  NotificationPermissionStatus,
  PushNotificationToken,
} from '@/types/notification.types';
import {
  checkPermissions,
  registerForPushNotifications,
  requestPermissions,
  setupAllNotificationChannels,
} from '@/utils/notifications';

/**
 * 알림 Hook
 *
 * 알림 권한, 푸시 토큰, 알림 리스너를 관리합니다.
 */
export function useNotifications(handlers?: NotificationHandlers) {
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>('undetermined');
  const [pushToken, setPushToken] = useState<PushNotificationToken | null>(
    null,
  );
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  /**
   * 알림 권한 요청
   */
  const requestNotificationPermissions = async () => {
    const status = await requestPermissions();

    setPermissionStatus(status);
    return status;
  };

  /**
   * 푸시 알림 등록
   */
  const registerPushNotifications = async () => {
    const token = await registerForPushNotifications();

    setPushToken(token);
    return token;
  };

  /**
   * 초기화
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // 권한 확인
        let status = await checkPermissions();

        // 권한이 없으면 요청
        if (status !== 'granted') {
          status = await requestPermissions();
        }

        setPermissionStatus(status);

        // Android 채널 설정
        if (Platform.OS === 'android') {
          await setupAllNotificationChannels();
        }

        // 권한이 있으면 푸시 토큰 등록
        if (status === 'granted') {
          const token = await registerForPushNotifications();

          setPushToken(token);
        }

        setIsInitialized(true);
      } catch {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  /**
   * 알림 리스너 설정
   */
  useEffect(() => {
    // 앱이 포그라운드일 때 알림 수신 리스너
    notificationListener.current =
      Notifications.addNotificationReceivedListener((receivedNotification) => {
        setNotification(receivedNotification);
        handlers?.onReceived?.(receivedNotification);
      });

    // 사용자가 알림을 탭했을 때 리스너
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handlers?.onResponseReceived?.({
          notification: response.notification,
          actionIdentifier: response.actionIdentifier,
          userText: response.userText,
        });
      });

    // 클린업
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [handlers]);

  return {
    // 상태
    permissionStatus,
    pushToken,
    notification,
    isInitialized,

    // 액션
    requestPermissions: requestNotificationPermissions,
    registerPushNotifications,
  };
}

/**
 * 알림 핸들러 기본 동작 설정
 *
 * 앱 전역에서 알림이 어떻게 표시될지 설정합니다.
 * _layout.tsx에서 호출하면 됩니다.
 */
export function setNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, // 알림 배너 표시 (deprecated, use shouldShowBanner)
      shouldPlaySound: true, // 소리 재생
      shouldSetBadge: true, // 배지 설정 (iOS)
      shouldShowBanner: true, // 알림 배너 표시 (Android 12+)
      shouldShowList: true, // 알림 목록에 표시 (Android 12+)
    }),
  });
}
