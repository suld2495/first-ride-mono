import { useQuery } from '@tanstack/react-query';

import { fetchRequiredAppVersion } from '@/api/app-version.api';

const appVersionKeys = {
  config: (userId: string) => ['app-version', 'config', userId] as const,
};

export const useRequiredAppVersionQuery = (
  userId?: string,
  enabled: boolean = true,
) =>
  useQuery({
    queryKey: appVersionKeys.config(userId ?? ''),
    queryFn: () => fetchRequiredAppVersion(),
    enabled: enabled && !!userId,
    retry: false,
    retryOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
