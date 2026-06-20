import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

interface DockTabItemProps {
  label: string;
  icon: (props: { color: string; focused: boolean }) => React.ReactNode;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  animatedStyle: StyleProp<ViewStyle>;
  onPress: () => void;
  onLongPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
}

export const DockTabItem: React.FC<DockTabItemProps> = ({
  label,
  icon,
  focused,
  activeColor,
  inactiveColor,
  animatedStyle,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
}) => {
  const color = focused ? activeColor : inactiveColor;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.pressable}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.itemContainer, animatedStyle]}>
        {icon({ color, focused })}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  itemContainer: {
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
