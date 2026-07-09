import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type {
  NavigationHelpers,
  TabNavigationState,
} from '@react-navigation/native';

import { DockTabBar } from '@/components/navigation/dock-tab-bar';

import { render } from '../../setup/test-utils';

const createRoute = (name: string, index: number) => ({
  key: `${name}-${index}`,
  name,
  params: undefined,
});

describe('DockTabBar', () => {
  it('통계 탭 route를 표시하고 랭킹 탭 route를 숨긴다', () => {
    const routes = [
      createRoute('(afterLogin)/(routine)/index', 0),
      createRoute('(afterLogin)/(quest)/index', 1),
      createRoute('(afterLogin)/(stats)/index', 2),
      createRoute('(afterLogin)/(ranking)/index', 3),
      createRoute('(afterLogin)/(friend)/index', 4),
      createRoute('(afterLogin)/my-info', 5),
    ];
    const descriptors = Object.fromEntries(
      routes.map((route, index) => [
        route.key,
        {
          options: {
            title: ['루틴', '퀘스트', '통계', '랭킹', '친구', 'My'][index],
            tabBarIcon: () => null,
          },
        },
      ]),
    ) as unknown as BottomTabBarProps['descriptors'];
    const props = {
      state: {
        key: 'tab-state',
        index: 0,
        routeNames: routes.map((route) => route.name),
        routes,
        type: 'tab',
        stale: false,
        history: [],
        preloadedRouteKeys: [],
      } as unknown as TabNavigationState<Record<string, object | undefined>>,
      descriptors,
      navigation: {
        emit: jest.fn(() => ({ defaultPrevented: false })),
        navigate: jest.fn(),
      } as unknown as NavigationHelpers<Record<string, object | undefined>>,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    } as BottomTabBarProps;

    const { getByLabelText, queryByLabelText } = render(
      <DockTabBar {...props} />,
    );

    expect(getByLabelText('루틴')).toBeOnTheScreen();
    expect(getByLabelText('퀘스트')).toBeOnTheScreen();
    expect(getByLabelText('통계')).toBeOnTheScreen();
    expect(queryByLabelText('랭킹')).toBeNull();
    expect(getByLabelText('친구')).toBeOnTheScreen();
    expect(getByLabelText('My')).toBeOnTheScreen();
  });
});
