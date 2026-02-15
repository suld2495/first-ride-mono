import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnistyles } from 'react-native-unistyles';
import { Tabs } from 'expo-router';

import TabBarIcon from '@/components/common/TabBarIcon';
import { DockTabBar } from '@/components/navigation/DockTabBar';

const DOCK_HEIGHT = 60;

export default function TabLayout() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="(afterLogin)/(routine)/index"
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        sceneStyle: {
          paddingBottom: DOCK_HEIGHT + insets.bottom,
        },
        tabBarStyle: {
          position: 'absolute',
          height: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="(afterLogin)/(routine)/index"
        options={{
          title: '루틴',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(afterLogin)/(quest)/index"
        options={{
          title: '퀘스트',
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(afterLogin)/(stat)/index"
        options={{
          title: '스탯',
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(afterLogin)/(friend)/index"
        options={{
          title: '친구',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(afterLogin)/my-info"
        options={{
          title: 'My',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
