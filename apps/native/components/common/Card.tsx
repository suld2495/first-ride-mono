import React from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

/**
 * Card variant types
 * - base: 전체 화면 배경
 * - surface: 카드, 리스트 아이템 배경 (default)
 * - sunken: 입력창 내부
 */
export type CardVariant = 'base' | 'surface' | 'sunken';

/**
 * Card padding sizes
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Card border radius sizes
 */
export type CardRadius = 'none' | 's' | 'm' | 'l' | 'xl';

export interface CardProps extends Omit<ViewProps, 'style'> {
  /**
   * Card variant (semantic surface token)
   * @default 'surface'
   */
  variant?: CardVariant;

  /**
   * Padding size
   * @default 'md'
   */
  padding?: CardPadding;

  /**
   * Border radius size
   * @default 'l'
   */
  radius?: CardRadius;

  /**
   * Custom style override
   */
  style?: ViewProps['style'];

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

/**
 * Card component with semantic surface colors and consistent styling.
 *
 * @example
 * // Basic card
 * <Card>
 *   <Typography>Card content</Typography>
 * </Card>
 *
 * @example
 * // Different variants
 * <Card variant="base">Base surface</Card>
 * <Card variant="surface">Card surface</Card>
 * <Card variant="sunken">Sunken well</Card>
 *
 * @example
 * // Different sizes
 * <Card padding="sm">Small padding</Card>
 * <Card padding="lg" radius="xl">Large card</Card>
 */
export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  padding = 'md',
  radius = 'l',
  style,
  children,
  ...props
}) => {
  styles.useVariants({
    variant,
    padding,
    radius,
  } as UnistylesVariants<typeof styles>);

  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    variants: {
      variant: {
        base: {
          backgroundColor: theme.colors.background.base,
        },
        surface: {
          backgroundColor: theme.colors.background.surface,
        },
        sunken: {
          backgroundColor: theme.colors.background.sunken,
        },
      },
      padding: {
        none: { padding: 0 },
        sm: { padding: theme.foundation.spacing.s },
        md: { padding: theme.foundation.spacing.m },
        lg: { padding: theme.foundation.spacing.l },
        xl: { padding: theme.foundation.spacing.xl },
      },
      radius: {
        none: { borderRadius: theme.foundation.radii.none },
        s: { borderRadius: theme.foundation.radii.s },
        m: { borderRadius: theme.foundation.radii.m },
        l: { borderRadius: theme.foundation.radii.l },
        xl: { borderRadius: theme.foundation.radii.xl },
      },
    },
  },
}));

export default Card;
