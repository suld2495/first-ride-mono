import React from 'react';
import { View, type ViewProps } from 'react-native';
import { borderRadius, spacing, surfaceColors } from '@repo/design-system';

import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Card variant types
 */
export type CardVariant = 'base' | 'raised' | 'sunken';

/**
 * Card padding sizes
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Card border radius sizes
 */
export type CardBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends Omit<ViewProps, 'style'> {
  /**
   * Card variant (semantic surface token)
   * - base: Base surface
   * - raised: Raised surface (default for cards)
   * - sunken: Sunken surface (wells, insets)
   * @default 'raised'
   */
  variant?: CardVariant;

  /**
   * Padding size
   * @default 'md'
   */
  padding?: CardPadding;

  /**
   * Border radius size
   * @default 'lg'
   */
  borderRadius?: CardBorderRadius;

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
 * <Card variant="raised">Raised card</Card>
 * <Card variant="sunken">Sunken well</Card>
 *
 * @example
 * // Different sizes
 * <Card padding="sm">Small padding</Card>
 * <Card padding="lg" borderRadius="xl">Large card</Card>
 *
 * @example
 * // No padding
 * <Card padding="none">
 *   <Image source={...} />
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  variant = 'raised',
  padding = 'md',
  borderRadius: borderRadiusSize = 'lg',
  style,
  children,
  ...props
}) => {
  const colorScheme = useColorScheme();

  // Get semantic surface color
  const backgroundColor = surfaceColors[variant][colorScheme];

  // Padding mapping
  const paddingMap: Record<CardPadding, number> = {
    none: 0,
    sm: spacing[3], // 12
    md: spacing[4], // 16
    lg: spacing[5], // 20
    xl: spacing[6], // 24
  };

  // Border radius mapping
  const borderRadiusMap: Record<CardBorderRadius, number> = {
    none: 0,
    sm: borderRadius.sm, // 4
    md: borderRadius.md, // 6
    lg: borderRadius.lg, // 8
    xl: borderRadius.xl, // 12
  };

  const cardStyle = {
    backgroundColor,
    padding: paddingMap[padding],
    borderRadius: borderRadiusMap[borderRadiusSize],
  };

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};

export default Card;
