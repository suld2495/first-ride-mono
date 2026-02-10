import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnistyles } from 'react-native-unistyles';
import { type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';

import TabBarIcon from '@/components/common/TabBarIcon';

const AnimatedTabBarButton = ({
  children,
  onPress,
  style,
  ...props
}: Omit<BottomTabBarButtonProps, 'ref'>) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const { theme } = useUnistyles();

  const handlePressOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1.05,
        useNativeDriver: true,
        speed: 200,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 200,
      }),
    ]).start();
  };

  return (
    <Pressable
      {...props}
      onPress={onPress}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.9 : 1 }],
          backgroundColor: pressed
            ? theme.colors.background.surface
            : 'transparent',
        },
        style,
      ]}
      android_ripple={{ borderless: false, radius: 0 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function TabLayout() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        initialRouteName="(afterLogin)/(routine)/index"
        screenOptions={{
          headerShown: false,
          tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
          tabBarIconStyle: { alignSelf: 'center' },
          tabBarActiveTintColor: theme.colors.action.primary.default,
          tabBarInactiveTintColor: theme.colors.text.tertiary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          tabBarStyle: {
            height: 45 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 2,
            paddingHorizontal: 20,
            justifyContent: 'center',
            borderTopWidth: 0,
          },
        }}
      >
        <Tabs.Screen
          name="(afterLogin)/(routine)/index"
          options={{
            title: '루틴',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="list" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(afterLogin)/(quest)/index"
          options={{
            title: '퀘스트',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="trophy" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(afterLogin)/(stat)/index"
          options={{
            title: '스탯',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="star" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(afterLogin)/(friend)/index"
          options={{
            title: '친구',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="users" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(afterLogin)/my-info"
          options={{
            title: 'My',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="user" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
