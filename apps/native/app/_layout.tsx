import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { QueryProvider } from '@repo/shared/components';
import { useQueryClient } from '@tanstack/react-query';
import type { FontSource } from 'expo-font';
import { useFonts } from 'expo-font';
import type { Href } from 'expo-router';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { updatePushToken } from '@/api/push-token.api';
import MockProvider from '@/components/mock/mock-provider';
import SplashScreenController from '@/components/splash';
import AppTamaguiProvider, {
  ThemeStyleRefreshBoundary,
} from '@/components/ui/tamagui-provider';
import ToastContainer from '@/components/ui/toast-container';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { useAppActiveRefresh } from '@/hooks/useAppActiveRefresh';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  setNotificationHandler,
  useNotifications,
} from '@/hooks/useNotifications';
import { useSetRequestId } from '@/hooks/useRequestSelection';
import { useSetRoutineId } from '@/hooks/useRoutineSelection';
import { useInitialAndroidBarSync } from '@/hooks/useThemeColor';
import {
  useSetAppColorScheme,
  useSyncAppColorScheme,
} from '@/hooks/useThemePreference';
import { useVisitCheck } from '@/hooks/useVisitCheck';
import { getPendingRoutineShare } from '@/share/routine-share';
import { fontFamilies } from '@/theme/font-families';
import { getThemeNameFromUserJob } from '@/theme/job-theme';
import { NAV_THEME } from '@/theme/nav-theme';
import type { NotificationHandlers } from '@/types/notification-types';
import {
  getAuthStackInitialRouteName,
  getAuthStackKey,
} from '@/utils/auth-stack-route';
import { initializeClarity } from '@/utils/clarity';
import { initializeKakao } from '@/utils/initialize-kakao';
import {
  extractDeepLinkData,
  getNotificationNavigationIntent,
  syncBadgeCountFromNotification,
  syncBadgeCountWithReceivedRequests,
} from '@/utils/notifications';
import { refreshRoutineWidgetSnapshot } from '@/utils/routine-widget-refresh';

// Tamagui initialization - must be imported before any component using styles
import '@/api/bootstrap.api';
import 'react-native-url-polyfill/auto';

const fontAssets: Record<string, FontSource> = {
  [fontFamilies.regular]:
    require('../assets/fonts/Pretendard-Regular.otf') as FontSource,
  [fontFamilies.medium]:
    require('../assets/fonts/Pretendard-Medium.otf') as FontSource,
  [fontFamilies.semibold]:
    require('../assets/fonts/Pretendard-SemiBold.otf') as FontSource,
  [fontFamilies.bold]:
    require('../assets/fonts/Pretendard-Bold.otf') as FontSource,
};

async function initializeKakaoSafely(): Promise<void> {
  try {
    await initializeKakao();
  } catch (error: unknown) {
    console.error('[Kakao] SDK initialization failed', error);
  }
}

void initializeKakaoSafely();

initializeClarity();

interface StackLayoutProps {
  isFontReady: boolean;
}

const StackLayout = ({ isFontReady }: StackLayoutProps) => {
  const user = useAuthUser();
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar
        key={`root-status-bar-${colorScheme}`}
        style={colorScheme === 'light' ? 'dark' : 'light'}
      />
      <SplashScreenController isReady={isFontReady} />
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <Stack
          key={getAuthStackKey(!!user)}
          initialRouteName={getAuthStackInitialRouteName(!!user)}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="modal" options={{ headerShown: false }} />
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="account" options={{ headerShown: false }} />
            <Stack.Screen
              name="routine-settings"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="notification-settings"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="hall-of-heroes"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="inquiry" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen
              name="sign-up-email-verification"
              options={{ headerShown: false }}
            />
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

interface AppShellProps {
  isFontReady: boolean;
}

function AppShell({ isFontReady }: AppShellProps) {
  useInitialAndroidBarSync();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthUser();
  const themeName = useColorScheme();
  const setRequestId = useSetRequestId();
  const setRoutineId = useSetRoutineId();
  const setColorScheme = useSetAppColorScheme();
  const syncWithTamagui = useSyncAppColorScheme();
  const handledShareSessionIdRef = useRef<string | null>(null);
  const { showToast } = useToast();

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

      void refreshRoutineWidgetSnapshot({
        nickname: user.nickname,
        themeName,
        queryClient,
      });

      const data = extractDeepLinkData(response.notification);

      void (async () => {
        try {
          const intent = await getNotificationNavigationIntent(data);

          if (intent.kind === 'toast') {
            showToast(intent.message, 'info');
            return;
          }

          // 알림 타입에 따라 store 설정
          if (data?.requestId) {
            setRequestId(data.requestId);
          }
          if (data?.routineId) {
            setRoutineId(data.routineId);
          }

          // 해당 화면으로 이동
          router.push(intent.path as Href);
        } catch {
          showToast('알림을 처리하지 못했습니다. 다시 시도해주세요.', 'error');
        }
      })();
    },
    [
      user,
      themeName,
      queryClient,
      showToast,
      router,
      setRequestId,
      setRoutineId,
    ],
  );

  const handleNotificationReceived = useCallback(
    (
      notification: Parameters<
        NonNullable<NotificationHandlers['onReceived']>
      >[0],
    ) => {
      if (!user) {
        return;
      }

      void syncBadgeCountFromNotification(notification);
      void refreshRoutineWidgetSnapshot({
        nickname: user.nickname,
        themeName,
        queryClient,
      });
    },
    [user, themeName, queryClient],
  );

  const notificationHandlers: NotificationHandlers = useMemo(
    () => ({
      onReceived: handleNotificationReceived,
      onResponseReceived: handleNotificationResponse,
    }),
    [handleNotificationReceived, handleNotificationResponse],
  );

  const { pushToken, isInitialized } = useNotifications(notificationHandlers);

  useAppActiveRefresh(user?.nickname || '', themeName);

  const openPendingRoutineShare = useCallback(async () => {
    if (!user) {
      return;
    }

    const pendingShare = await getPendingRoutineShare();

    if (
      !pendingShare ||
      handledShareSessionIdRef.current === pendingShare.sessionId
    ) {
      return;
    }

    handledShareSessionIdRef.current = pendingShare.sessionId;
    setRoutineId(pendingShare.routineId);
    router.push(
      `/modal?type=request&routineId=${pendingShare.routineId}&shareSessionId=${pendingShare.sessionId}` as Href,
    );
  }, [router, setRoutineId, user]);

  useEffect(() => {
    void openPendingRoutineShare();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void openPendingRoutineShare();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [openPendingRoutineShare]);

  // 앱 시작 시 저장된 테마를 Tamagui에 동기화
  useEffect(() => {
    syncWithTamagui();
  }, [syncWithTamagui]);

  useEffect(() => {
    const jobThemeName = getThemeNameFromUserJob(user);

    if (jobThemeName && jobThemeName !== themeName) {
      setColorScheme(jobThemeName);
    }
  }, [setColorScheme, themeName, user]);

  // 알림 핸들러 초기화
  useEffect(() => {
    setNotificationHandler();
  }, []);

  // 앱 진입 시 받은 인증 요청 목록 개수로 홈 화면 아이콘 배지를 동기화
  useEffect(() => {
    if (!user) {
      return;
    }

    void syncBadgeCountWithReceivedRequests();
  }, [user]);

  // 출석 체크
  useVisitCheck(!!user);

  // 푸시 토큰 변경 감지 및 자동 업데이트
  useEffect(() => {
    if (isInitialized && pushToken?.data && user?.userId) {
      void updatePushToken(
        pushToken.data,
        Platform.OS as 'ios' | 'android',
      ).catch(() => undefined);
    }
  }, [pushToken, user?.userId, isInitialized]);

  return (
    <>
      <MockProvider />
      <StackLayout isFontReady={isFontReady} />
      <ToastContainer />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontLoadError] = useFonts(fontAssets);
  const isFontReady = fontsLoaded || !!fontLoadError;

  if (!isFontReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppTamaguiProvider>
        <QueryProvider>
          <ToastProvider>
            <ThemeStyleRefreshBoundary>
              <AppShell isFontReady={isFontReady} />
            </ThemeStyleRefreshBoundary>
          </ToastProvider>
        </QueryProvider>
      </AppTamaguiProvider>
    </GestureHandlerRootView>
  );
}
