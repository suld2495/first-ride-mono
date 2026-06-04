import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';

import { useAuthIsLoading } from '@/hooks/useAuthSession';

interface SplashScreenControllerProps {
  isReady?: boolean;
}

export default function SplashScreenController({
  isReady = true,
}: SplashScreenControllerProps) {
  const isLoading = useAuthIsLoading();

  useEffect(() => {
    if (isReady && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, isReady]);

  return null;
}
