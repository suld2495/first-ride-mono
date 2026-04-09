import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';

import { useAuthIsLoading } from '@/hooks/useAuthSession';

export default function SplashScreenController() {
  const isLoading = useAuthIsLoading();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}
