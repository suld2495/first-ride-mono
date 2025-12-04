import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnistyles } from 'react-native-unistyles';
import { type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
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
        screenOptions={{
          headerShown: false,
          tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
          tabBarIconStyle: { alignSelf: 'center' },
          tabBarLabelStyle: {
            color: theme.colors.text.primary,
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
            tabBarIcon: () => (
              <TabBarIcon name="list" color={theme.colors.text.primary} />
            ),
          }}
        />
        <Tabs.Screen
          name="(afterLogin)/(quest)/index"
          options={{
            title: '퀘스트',
            tabBarIcon: () => (
              <TabBarIcon name="trophy" color={theme.colors.text.primary} />
            ),
          }}
        />
        <Tabs.Screen
          name="(afterLogin)/(friend)/index"
          options={{
            title: '친구',
            tabBarIcon: () => (
              <TabBarIcon name="users" color={theme.colors.text.primary} />
            ),
          }}
        />
        <Tabs.Screen
          name="(afterLogin)/my-info"
          options={{
            title: 'My',
            tabBarIcon: () => (
              <TabBarIcon name="user" color={theme.colors.text.primary} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
