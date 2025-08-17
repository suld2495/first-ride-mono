import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import MockProvider from '@/components/mock/MockProvider';
import SplashScreenController from '@/components/splash';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInitialAndroidBarSync } from '@/hooks/useThemeColor';
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
              options={{ presentation: 'modal', headerShown: false }}
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
  const [queryClient] = React.useState(() => new QueryClient());

  useInitialAndroidBarSync();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <MockProvider />
        <StackLayout />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
