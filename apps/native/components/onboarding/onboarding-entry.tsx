import { Redirect, usePathname } from 'expo-router';

import { useAuthIsLoading, useAuthUser } from '@/hooks/useAuthSession';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function OnboardingEntry() {
  const pathname = usePathname();
  const user = useAuthUser();
  const isAuthLoading = useAuthIsLoading();
  const { isLoading, isCompleted } = useOnboarding();

  if (
    user ||
    isAuthLoading ||
    isLoading ||
    isCompleted ||
    pathname !== '/sign-in'
  ) {
    return null;
  }

  return <Redirect href="/onboarding" />;
}
