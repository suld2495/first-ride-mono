import { createBrowserRouter } from 'react-router';

import Layout from '@/layouts/common/Layout';
import RoutineLayout from '@/layouts/routine/RoutineLayout';
import LoginPage from '@/pages/Login';
import RoutinePage from '@/pages/Routine';
import JoinPage from '@/pages/Join';
import FriendPage from '@/pages/Friend';

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
        Component: JoinPage
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
      }
    ],
  },
]);

export default router;
