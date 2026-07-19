import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { useReceivedRoutineChangeRequestsQuery } from '@repo/shared/hooks/useRoutine';
import { useEffect } from 'react';

import { setBadgeCount } from '@/utils/notifications';

export const useReceivedRequests = (nickname: string) => {
  const query = useFetchReceivedRequestsQuery(nickname);
  const routineChangeQuery = useReceivedRoutineChangeRequestsQuery(nickname);
  const notificationCount =
    query.data.length + (routineChangeQuery.data?.length ?? 0);

  useEffect(() => {
    if (!nickname || !query.isFetched || !routineChangeQuery.isFetched) {
      return;
    }

    void setBadgeCount(notificationCount);
  }, [
    nickname,
    notificationCount,
    query.isFetched,
    routineChangeQuery.isFetched,
  ]);

  return { ...query, notificationCount };
};
