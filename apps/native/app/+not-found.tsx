import { Redirect } from 'expo-router';

import { useAuthUser } from '@/hooks/useAuthSession';

export default function NotFoundScreen() {
  const user = useAuthUser();

  return (
    <Redirect href={user ? '/(tabs)/(afterLogin)/(routine)' : '/sign-in'} />
  );
}
