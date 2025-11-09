import { createBrowserRouter } from 'react-router';

import AdminLayout from '@/layouts/common/admin/AdminLayout';
import Layout from '@/layouts/common/Layout';
import RoutineLayout from '@/layouts/routine/RoutineLayout';
import QuestDetail from '@/pages/admin/QuestDetail';
import QuestManagement from '@/pages/admin/QuestManagement';
import RewardManagement from '@/pages/admin/RewardManagement';
import FriendPage from '@/pages/Friend';
import JoinPage from '@/pages/Join';
import LoginPage from '@/pages/Login';
import QuestPage from '@/pages/quest/Quest';
import RoutinePage from '@/pages/Routine';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'join',
        Component: JoinPage,
      },
      {
        Component: RoutineLayout,
        children: [
          {
            index: true,
            Component: RoutinePage,
          },
        ],
      },
      {
        path: '/friends',
        Component: FriendPage,
      },
      {
        path: 'quest',
        Component: QuestPage,
      },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        path: 'quest-management',
        Component: QuestManagement,
      },
      {
        path: 'quest-management/:id',
        Component: QuestDetail,
      },
      {
        path: 'reward-management',
        Component: RewardManagement,
      },
    ],
  },
]);

export default router;
