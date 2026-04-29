import React from 'react';
import type { ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { Typography } from './typography';

interface PixelButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) => {
  const { theme } = useAppTheme();

  const outerStyle = {
    primary: {
      borderColor: theme.colors.border.strong,
      backgroundColor: theme.colors.action.primary.default,
    },
    secondary: {
      borderColor: theme.colors.border.strong,
      backgroundColor: theme.colors.action.secondary.default,
    },
    danger: {
      borderColor: theme.colors.border.strong,
      backgroundColor: theme.colors.feedback.error.bg,
    },
  }[variant];

  const innerStyle = {
    primary: {
      borderColor: theme.colors.action.primary.label,
      backgroundColor: theme.colors.action.primary.default,
    },
    secondary: {
      borderColor: theme.colors.action.secondary.label,
      backgroundColor: theme.colors.action.secondary.default,
    },
    danger: {
      borderColor: theme.colors.feedback.error.text,
      backgroundColor: theme.colors.feedback.error.bg,
    },
  }[variant];

  const labelStyle = {
    primary: {
      color: theme.colors.action.primary.label,
    },
    secondary: {
      color: theme.colors.action.secondary.label,
    },
    danger: {
      color: theme.colors.feedback.error.text,
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={[styles.borderOuter, outerStyle]}>
        <View style={[styles.borderInner, innerStyle]}>
          <Typography variant="subtitle" style={[styles.label, labelStyle]}>
            {label}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create(() => ({
  container: {
    minWidth: baseFoundation.dimension.x120,
    marginVertical: baseFoundation.spacing.xs,
  },
  pressed: {
    transform: [{ translateY: 2 }],
  },
  disabled: {
    opacity: 0.6,
  },
  borderOuter: {
    borderWidth: 4,
    borderRadius: baseFoundation.radii.none,
    padding: baseFoundation.dimension.x2,
  },
  borderInner: {
    borderWidth: 2,
    borderRadius: baseFoundation.radii.none,
    paddingVertical: baseFoundation.spacing.s,
    paddingHorizontal: baseFoundation.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
  },
  label: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },
}));

export default PixelButton;
