import { SplashScreen } from 'expo-router';

import { useUserStore } from '@/store/user.store';

export function SplashScreenController() {
  SplashScreen.hideAsync();
  const { isLoading } = useUserStore();

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
}
