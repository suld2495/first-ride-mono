import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable } from 'react-native';

import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

const SWITCH_THUMB_TRAVEL = baseFoundation.dimension.x20;
const SWITCH_ANIMATION_DURATION_MS = 160;

export type NotificationSwitchProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  onValueChange: (enabled: boolean) => void;
  testID: string;
  value: boolean;
};

export default function NotificationSwitch({
  accessibilityLabel,
  disabled = false,
  onValueChange,
  testID,
  value,
}: NotificationSwitchProps) {
  const thumbTranslateX = useRef(
    new Animated.Value(value ? SWITCH_THUMB_TRAVEL : 0),
  ).current;

  useEffect(() => {
    const animation = Animated.timing(thumbTranslateX, {
      toValue: value ? SWITCH_THUMB_TRAVEL : 0,
      duration: SWITCH_ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [thumbTranslateX, value]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={baseFoundation.dimension.x8}
      onPress={() => {
        onValueChange(!value);
      }}
      style={[
        styles.switchTrack,
        value ? styles.switchTrackOn : styles.switchTrackOff,
        disabled ? styles.switchTrackDisabled : null,
      ]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.switchThumb,
          {
            transform: [{ translateX: thumbTranslateX }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  switchTrack: {
    width: baseFoundation.dimension.x52,
    height: baseFoundation.dimension.x32,
    justifyContent: 'center',
    borderRadius: baseFoundation.radii.round,
    padding: baseFoundation.dimension.x2,
  },
  switchTrackOn: {
    backgroundColor: theme.colors.action.primary.default,
  },
  switchTrackOff: {
    backgroundColor: theme.colors.border.default,
  },
  switchTrackDisabled: {
    opacity: 0.5,
  },
  switchThumb: {
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    borderRadius: baseFoundation.radii.round,
    backgroundColor: theme.colors.background.elevated,
  },
}));
