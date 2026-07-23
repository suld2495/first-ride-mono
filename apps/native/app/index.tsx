import { Redirect } from 'expo-router';

import { useAuthIsLoading, useAuthUser } from '@/hooks/useAuthSession';

export default function Index() {
  const user = useAuthUser();
  const isAuthLoading = useAuthIsLoading();

  if (isAuthLoading) {
    return null;
  }

  return (
    <Redirect
      href={user ? '/(tabs)/(afterLogin)/(routine)' : '/sign-in'}
    />
  );
}
