import { SplashScreen } from 'expo-router';

import { useAuthIsLoading } from '@/hooks/useAuthSession';

export default function SplashScreenController() {
  SplashScreen.hideAsync();
  const isLoading = useAuthIsLoading();

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
}
