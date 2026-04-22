import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import { useUnistyles } from '@/lib/unistyles';

import { DockTabItem } from './dock-tab-item';

const TAB_BAR_HEIGHT = 44;
const TAB_BAR_HORIZONTAL_PADDING = 8;
const TAB_BAR_BACKGROUND = '#F7F4F4';
const TAB_BAR_BOTTOM_PADDING = 6;
const TAB_ROUTE_NAMES = new Set([
  '(afterLogin)/(routine)/index',
  '(afterLogin)/(quest)/index',
  '(afterLogin)/(friend)/index',
  '(afterLogin)/my-info',
]);

export const DockTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  insets,
}) => {
  const { theme } = useUnistyles();
  const visibleRoutes = state.routes.filter((route) =>
    TAB_ROUTE_NAMES.has(route.name),
  );

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: TAB_BAR_BACKGROUND,
        paddingBottom: Math.min(insets.bottom, TAB_BAR_BOTTOM_PADDING),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: TAB_BAR_HEIGHT,
          paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
        }}
      >
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = route.key === state.routes[state.index]?.key;

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
              animatedStyle={undefined}
              onPress={onPress}
              onLongPress={onLongPress}
              onPressIn={undefined}
              onPressOut={undefined}
            />
          );
        })}
      </View>
    </View>
  );
};
