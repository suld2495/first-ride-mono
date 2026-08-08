import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { usePendingConfirmationCountQuery } from '@repo/shared/hooks/useNotificationBadge';
import { useEffect } from 'react';

import { setBadgeCount } from '@/utils/notifications';

export const useReceivedRequests = (nickname: string) => {
  const query = useFetchReceivedRequestsQuery(nickname);
  const badgeCountQuery = usePendingConfirmationCountQuery(nickname);
  const notificationCount = badgeCountQuery.data ?? 0;

  useEffect(() => {
    if (!nickname || !badgeCountQuery.isSuccess) {
      return;
    }

    void setBadgeCount(notificationCount);
  }, [nickname, notificationCount, badgeCountQuery.isSuccess]);

  return { ...query, notificationCount };
};
