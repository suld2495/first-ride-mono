import { Outlet } from 'react-router';

import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { useAuthStore } from '@repo/shared/store/auth.store';

import RoutineHeader from './RoutineHeader';

const RoutineLayout = () => {
  const user = useAuthStore((state) => state.user);
  const nickname = user?.name || '';

  const { data: requests } = useFetchReceivedRequestsQuery(nickname);

  return (
    <div className="flex flex-col w-full h-full">
      <RoutineHeader list={requests} nickname={nickname} />
      <div className="flex-1 pb-[var(--footer-height)]">
        <Outlet />
      </div>
    </div>
  );
};

export default RoutineLayout;
