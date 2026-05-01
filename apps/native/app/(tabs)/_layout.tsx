import { Tabs } from 'expo-router';

import { DockTabBar } from '@/components/navigation/dock-tab-bar';
import TabBarIcon from '@/components/ui/tab-bar-icon';
import { baseFoundation } from '@/theme/tokens';

const TAB_BAR_ICONS = {
  home: require('../../assets/tab-bar/home.png'),
  quest: require('../../assets/tab-bar/quest.png'),
  friend: require('../../assets/tab-bar/friend.png'),
  settings: require('../../assets/tab-bar/settings.png'),
} as const;

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="(afterLogin)/(routine)/index"
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          paddingBottom: baseFoundation.spacing.none,
        },
        tabBarStyle: {
          position: 'absolute',
          height: baseFoundation.dimension.x0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(afterLogin)/(routine)/index"
        options={{
          title: '루틴',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={TAB_BAR_ICONS.home} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(afterLogin)/(quest)/index"
        options={{
          title: '퀘스트',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={TAB_BAR_ICONS.quest} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(afterLogin)/(friend)/index"
        options={{
          title: '친구',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={TAB_BAR_ICONS.friend} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(afterLogin)/my-info"
        options={{
          title: 'My',
          tabBarIcon: ({ color }) => (
            <TabBarIcon source={TAB_BAR_ICONS.settings} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
