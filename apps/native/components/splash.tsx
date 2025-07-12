import { SplashScreen } from 'expo-router';

import { useAuthStore } from '@repo/shared/store/auth.store';

export function SplashScreenController() {
  SplashScreen.hideAsync();
  const { isLoading } = useAuthStore();

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
}
