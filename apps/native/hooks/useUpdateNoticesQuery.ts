import { useQuery } from '@tanstack/react-query';

import { fetchUpdateNotices } from '@/api/update-notices.api';

const updateNoticeKeys = {
  list: (userId: string) => ['update-notices', 'list', userId] as const,
};

export const useUpdateNoticesQuery = (userId?: string) =>
  useQuery({
    queryKey: updateNoticeKeys.list(userId ?? ''),
    queryFn: fetchUpdateNotices,
    enabled: !!userId,
    retry: false,
    retryOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
