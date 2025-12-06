import { SplashScreen } from 'expo-router';

import { useAuthStore } from '@/store/auth.store';

export default function SplashScreenController() {
  SplashScreen.hideAsync();
  const { isLoading } = useAuthStore();

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
}
