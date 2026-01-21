import React from 'react';
import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import {
  useFonts,
  PixelifySans_400Regular,
  PixelifySans_700Bold,
} from '@expo-google-fonts/pixelify-sans';

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
  const [fontsLoaded] = useFonts({
    PixelifySans_400Regular,
    PixelifySans_700Bold,
  });

  styles.useVariants({ variant } as UnistylesVariants<typeof styles>);

  if (!fontsLoaded) {
    return null;
  }

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
    fontFamily: 'PixelifySans_400Regular',
    color: theme.colors.text.primary,
    variants: {
      variant: {
        title: {
          fontFamily: 'PixelifySans_700Bold',
          fontSize: 28,
          letterSpacing: 1,
        },
        subtitle: {
          fontFamily: 'PixelifySans_700Bold',
          fontSize: 20,
          letterSpacing: 0.5,
        },
        body: {
          fontSize: 16,
        },
        label: {
          fontSize: 14,
          letterSpacing: 0.5,
        },
        value: {
          fontFamily: 'PixelifySans_700Bold',
          fontSize: 24,
        },
      },
    },
  },
  glow: {
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
}));

export default PixelText;
