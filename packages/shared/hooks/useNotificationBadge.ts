import { useQuery } from '@tanstack/react-query';

import { fetchPendingConfirmationCount } from '../api/notification.api';
import { notificationBadgeKeys } from '../types/query-keys/notification-badge';

export const usePendingConfirmationCountQuery = (userScope: string) =>
  useQuery({
    queryKey: notificationBadgeKeys.pendingConfirmationCount(userScope),
    queryFn: fetchPendingConfirmationCount,
    enabled: !!userScope,
    refetchOnMount: 'always',
  });
