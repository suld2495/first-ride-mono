import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryProvider } from '@repo/shared/components';
import { Platform } from 'react-native';

import MockProvider from '@/components/mock/MockProvider';
import SplashScreenController from '@/components/splash';
import ToastContainer from '@/components/common/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInitialAndroidBarSync } from '@/hooks/useThemeColor';
import { setNotificationHandler, useNotifications } from '@/hooks/useNotifications';
import { updatePushToken } from '@/api/push-token.api';
import { NAV_THEME } from '@/theme';
import 'react-native-url-polyfill/auto';

import '@/api';

const StackLayout = () => {
  const { user } = useAuthStore();
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
            <Stack.Screen
              name="modal"
              options={{ headerShown: false }}
            />
          </Stack.Protected>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </NavThemeProvider>
    </>
  );
};

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { user } = useAuthStore();
  const { pushToken, isInitialized } = useNotifications();

  // 알림 핸들러 초기화
  useEffect(() => {
    setNotificationHandler();
  }, []);

  // 푸시 토큰 변경 감지 및 자동 업데이트
  useEffect(() => {
    if (isInitialized && pushToken && user?.userId) {
      // 토큰이 변경되면 서버에 업데이트
      updatePushToken(
        user.userId,
        pushToken.data,
        Platform.OS as 'ios' | 'android'
      ).catch((error) => {
        console.error('Failed to update push token on change:', error);
      });
    }
  }, [pushToken?.data, user?.userId, isInitialized]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ToastProvider>
          <MockProvider />
          <StackLayout />
          <ToastContainer />
        </ToastProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
