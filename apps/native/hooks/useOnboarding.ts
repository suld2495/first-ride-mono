import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchOnboardingStatus,
  markOnboardingSeen,
} from '@/api/onboarding.api';
import { useAuthStore } from '@/store/auth.store';

export const useOnboarding = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const queryClient = useQueryClient();
  const queryKey = ['onboarding', user?.userId] as const;
  const query = useQuery({
    queryKey,
    queryFn: fetchOnboardingStatus,
    enabled: !!user && !isAuthLoading,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const complete = async () => {
    await markOnboardingSeen();
    queryClient.setQueryData(queryKey, { onboardingRequired: false });
  };

  return {
    isLoading: isAuthLoading || (!!user && query.isPending),
    isRequired: query.data?.onboardingRequired === true,
    error: user ? query.error : null,
    retry: query.refetch,
    complete,
  };
};
