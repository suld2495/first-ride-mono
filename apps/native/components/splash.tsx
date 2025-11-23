import { useAuthStore } from '@repo/shared/store/auth.store';
import { SplashScreen } from 'expo-router';

export default function SplashScreenController() {
  SplashScreen.hideAsync();
  const { isLoading } = useAuthStore();

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
}
