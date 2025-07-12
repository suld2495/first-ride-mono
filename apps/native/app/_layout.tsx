import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import MockProvider from '@/components/mock/MockProvider';
import { SplashScreenController } from '@/components/splash';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInitialAndroidBarSync } from '@/hooks/useThemeColor';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { NAV_THEME } from '@/theme';
import '@/api';


export default function RootLayout() {
  const [queryClient] = React.useState(() => new QueryClient());
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();

  useInitialAndroidBarSync();

  return (
    <QueryClientProvider client={queryClient}>
      <MockProvider />

      <StatusBar
        key={`root-status-bar-${colorScheme}`}
        style={colorScheme === 'light' ? 'dark' : 'light'}
      />
      <SplashScreenController />
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <GestureHandlerRootView style={{ flex: 1 }}>
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
            </Stack.Protected>
          </Stack>
        </GestureHandlerRootView>
      </NavThemeProvider>
    </QueryClientProvider>
  );
}
