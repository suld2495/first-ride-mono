import React from 'react';
import type { ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

import { PixelText } from './pixel-text';

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
  const { theme } = useUnistyles();

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
          <PixelText variant="subtitle" style={[styles.label, labelStyle]}>
            {label}
          </PixelText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create(() => ({
  container: {
    minWidth: 120,
    marginVertical: 4,
  },
  pressed: {
    transform: [{ translateY: 2 }],
  },
  disabled: {
    opacity: 0.6,
  },
  borderOuter: {
    borderWidth: 4,
    borderRadius: 0,
    padding: 2,
  },
  borderInner: {
    borderWidth: 2,
    borderRadius: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
