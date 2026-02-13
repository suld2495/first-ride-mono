import React from 'react';
import {
  Pressable,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import * as Haptics from 'expo-haptics';

import { PixelText } from '@/components/common/PixelText';

interface DockTabItemProps {
  label: string;
  icon: (props: { color: string; focused: boolean }) => React.ReactNode;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  animatedStyle: StyleProp<ViewStyle>;
  onPress: () => void;
  onLongPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
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
  onLayout,
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
      onLayout={onLayout}
      style={styles.pressable}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.itemContainer, animatedStyle]}>
        {icon({ color, focused })}
        <PixelText
          variant="label"
          color={color}
          style={styles.label}
        >
          {label}
        </PixelText>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.foundation.spacing.xs,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
}));
