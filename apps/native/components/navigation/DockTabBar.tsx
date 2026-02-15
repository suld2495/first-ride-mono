import React, { useCallback, useEffect, useRef } from 'react';
import { type LayoutChangeEvent, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useDockMagnification } from '@/hooks/useDockMagnification';

import { DockTabItem } from './DockTabItem';

interface TabLayout {
  x: number;
  width: number;
}

const INDICATOR_SPRING = { damping: 18, stiffness: 120, mass: 0.8 };

export const DockTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  insets,
}) => {
  const { theme } = useUnistyles();
  const isDark = theme.name === 'dark';

  const { getAnimatedScale, handlePressIn, handlePressOut, setActiveIndex } =
    useDockMagnification();

  const tabLayouts = useRef<TabLayout[]>([]);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const isReady = useSharedValue(0);

  const handleTabLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;

      tabLayouts.current[index] = { x, width };

      // Check if all tabs have been measured
      if (tabLayouts.current.filter(Boolean).length === state.routes.length) {
        const activeLayout = tabLayouts.current[state.index];

        if (activeLayout) {
          indicatorX.value = activeLayout.x;
          indicatorWidth.value = activeLayout.width;
          isReady.value = 1;
        }
      }
    },
    [state.routes.length, state.index, indicatorX, indicatorWidth, isReady],
  );

  useEffect(() => {
    setActiveIndex(state.index);

    const layout = tabLayouts.current[state.index];

    if (layout && isReady.value === 1) {
      indicatorX.value = withSpring(layout.x, INDICATOR_SPRING);
      indicatorWidth.value = withSpring(layout.width, INDICATOR_SPRING);
    }
  }, [state.index, setActiveIndex, indicatorX, indicatorWidth, isReady]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: isReady.value,
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const indicatorColor = isDark
    ? 'rgba(33, 150, 243, 0.15)'
    : 'rgba(30, 136, 229, 0.12)';

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 4,
              borderRadius: 16,
              backgroundColor: indicatorColor,
            },
            indicatorAnimatedStyle as unknown as ViewStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]!;
          const label = (options.title ?? route.name) as string;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const animatedScale = getAnimatedScale(index);

          return (
            <DockTabItem
              key={route.key}
              label={label}
              icon={({ color }) =>
                options.tabBarIcon?.({
                  color,
                  focused,
                  size: 20,
                }) ?? null
              }
              focused={focused}
              activeColor={
                options.tabBarActiveTintColor ?? theme.colors.text.primary
              }
              inactiveColor={
                options.tabBarInactiveTintColor ?? theme.colors.text.secondary
              }
              animatedStyle={animatedScale as unknown as ViewStyle}
              onPress={onPress}
              onLongPress={onLongPress}
              onPressIn={() => handlePressIn(index)}
              onPressOut={handlePressOut}
              onLayout={handleTabLayout(index)}
            />
          );
        })}
      </View>
    </View>
  );
};
