import { Redirect } from 'expo-router';

import { useAuthIsLoading, useAuthUser } from '@/hooks/useAuthSession';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Index() {
  const user = useAuthUser();
  const isAuthLoading = useAuthIsLoading();
  const { isLoading: isOnboardingLoading, isCompleted } = useOnboarding();

  if (isAuthLoading || (!user && isOnboardingLoading)) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)/(afterLogin)/(routine)" />;
  }

  return <Redirect href={isCompleted ? '/sign-in' : '/onboarding'} />;
}
