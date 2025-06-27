import { Outlet } from 'react-router';

import { useFetchReceivedRequestsQuery } from '@/hooks/useRequest';
import { useAuthStore } from '@/store/auth.store';

import RoutineHeader from './RoutineHeader';

const RoutineLayout = () => {
  const user = useAuthStore((state) => state.user);

  const { data: requests } = useFetchReceivedRequestsQuery(user);

  return (
    <div className="flex flex-col w-full h-full">
      <RoutineHeader list={requests} nickname={user} />
      <div className="flex-1 pb-[var(--footer-height)]">
        <Outlet />
      </div>
    </div>
  );
};

export default RoutineLayout;
