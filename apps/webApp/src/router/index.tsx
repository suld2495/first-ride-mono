import { createBrowserRouter } from 'react-router';

import Layout from '@/layouts/common/Layout';
import RoutineLayout from '@/layouts/routine/RoutineLayout';
import LoginPage from '@/pages/Login';
import RoutinePage from '@/pages/Routine';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: LoginPage,
      },
      {
        path: 'routine',
        Component: RoutineLayout,
        children: [
          {
            index: true,
            Component: RoutinePage,
          },
        ],
      },
    ],
  },
]);

export default router;
