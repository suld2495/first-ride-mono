import React from 'react';
import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

export type PixelTextVariant =
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'value';

export interface PixelTextProps extends TextProps {
  variant?: PixelTextVariant;
  color?: string;
  glow?: boolean;
  children?: React.ReactNode;
}

export const PixelText: React.FC<PixelTextProps> = ({
  variant = 'body',
  color,
  glow = false,
  style,
  children,
  ...props
}) => {
  styles.useVariants({ variant } as UnistylesVariants<typeof styles>);

  return (
    <Text
      style={[
        styles.base,
        color ? { color } : undefined,
        glow ? styles.glow : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    fontFamily: 'System',
    color: theme.colors.text.primary,
    variants: {
      variant: {
        title: {
          fontFamily: 'System',
          fontWeight: 'bold',
          fontSize: 28,
          letterSpacing: 0.5,
        },
        subtitle: {
          fontFamily: 'System',
          fontWeight: 'bold',
          fontSize: 20,
          letterSpacing: 0.2,
        },
        body: {
          fontSize: 16,
        },
        label: {
          fontSize: 14,
          letterSpacing: 0.2,
        },
        value: {
          fontFamily: 'System',
          fontWeight: 'bold',
          fontSize: 24,
        },
      },
    },
  },
  glow: {
    textShadowColor: theme.colors.action.primary.default,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
}));

export default PixelText;
