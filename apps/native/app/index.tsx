import { Redirect } from 'expo-router';

import { useAuthIsLoading, useAuthUser } from '@/hooks/useAuthSession';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function Index() {
  const user = useAuthUser();
  const isAuthLoading = useAuthIsLoading();
  const { isLoading: isOnboardingLoading, isRequired, error } = useOnboarding();

  if (isAuthLoading || (user && (isOnboardingLoading || error))) {
    return <Redirect href="/onboarding-loading" />;
  }

  if (user) {
    return (
      <Redirect
        href={isRequired ? '/onboarding' : '/(tabs)/(afterLogin)/(routine)'}
      />
    );
  }

  return <Redirect href="/sign-in" />;
}
