import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { useEffect } from 'react';

import { setBadgeCount } from '@/utils/notifications';

export const useReceivedRequests = (nickname: string) => {
  const query = useFetchReceivedRequestsQuery(nickname);

  useEffect(() => {
    if (!nickname || !query.isFetched) {
      return;
    }

    void setBadgeCount(query.data.length);
  }, [nickname, query.data, query.isFetched]);

  return query;
};
