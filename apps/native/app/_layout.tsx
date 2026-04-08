import { initializeKakaoSDK } from '@react-native-kakao/core';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { QueryProvider } from '@repo/shared/components';
import type { Href } from 'expo-router';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { updatePushToken } from '@/api/push-token.api';
import MockProvider from '@/components/mock/mock-provider';
import SplashScreenController from '@/components/splash';
import ToastContainer from '@/components/ui/toast-container';
import { ToastProvider } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  setNotificationHandler,
  useNotifications,
} from '@/hooks/useNotifications';
import { useSetRequestId } from '@/hooks/useRequestSelection';
import { useSetRoutineId } from '@/hooks/useRoutineSelection';
import { useInitialAndroidBarSync } from '@/hooks/useThemeColor';
import { useSyncAppColorScheme } from '@/hooks/useThemePreference';
import { useVisitCheck } from '@/hooks/useVisitCheck';
import { NAV_THEME } from '@/theme/nav-theme';
import type { NotificationHandlers } from '@/types/notification-types';
import { extractDeepLinkData, getDeepLinkPath } from '@/utils/notifications';

// Unistyles initialization - must be imported before any component using styles
import '@/api/bootstrap.api';
import '@/styles/unistyles';
import 'react-native-url-polyfill/auto';

initializeKakaoSDK(process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY!);

const StackLayout = () => {
  const user = useAuthUser();
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar
        key={`root-status-bar-${colorScheme}`}
        style={colorScheme === 'light' ? 'dark' : 'light'}
      />
      <SplashScreenController />
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen
              name="social-sign-up"
              options={{ headerShown: false }}
            />
          </Stack.Protected>
        </Stack>
      </NavThemeProvider>
    </>
  );
};

function AppShell() {
  useInitialAndroidBarSync();
  const router = useRouter();
  const user = useAuthUser();
  const setRequestId = useSetRequestId();
  const setRoutineId = useSetRoutineId();
  const syncWithUnistyles = useSyncAppColorScheme();

  /**
   * 알림 탭 시 딥링크 처리
   */
  const handleNotificationResponse = useCallback(
    (
      response: Parameters<
        NonNullable<NotificationHandlers['onResponseReceived']>
      >[0],
    ) => {
      // 로그인된 상태에서만 딥링크 처리
      if (!user) {
        return;
      }

      const data = extractDeepLinkData(response.notification);
      const path = getDeepLinkPath(data);

      // 알림 타입에 따라 store 설정
      if (data?.requestId) {
        setRequestId(data.requestId);
      }
      if (data?.routineId) {
        setRoutineId(data.routineId);
      }

      // 해당 화면으로 이동
      router.push(path as Href);
    },
    [user, router, setRequestId, setRoutineId],
  );

  const notificationHandlers: NotificationHandlers = useMemo(
    () => ({
      onResponseReceived: handleNotificationResponse,
    }),
    [handleNotificationResponse],
  );

  const { pushToken, isInitialized } = useNotifications(notificationHandlers);

  // 앱 시작 시 저장된 테마를 Unistyles에 동기화
  useEffect(() => {
    syncWithUnistyles();
  }, [syncWithUnistyles]);

  // 알림 핸들러 초기화
  useEffect(() => {
    setNotificationHandler();
  }, []);

  // 출석 체크
  useVisitCheck(!!user);

  // 푸시 토큰 변경 감지 및 자동 업데이트
  useEffect(() => {
    if (isInitialized && pushToken && user?.userId) {
      updatePushToken(
        user.userId,
        pushToken.data,
        Platform.OS as 'ios' | 'android',
      );
    }
  }, [pushToken, user?.userId, isInitialized]);

  return (
    <>
      <MockProvider />
      <StackLayout />
      <ToastContainer />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
