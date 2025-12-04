import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

/**
 * Badge variant types
 */
export type BadgeVariant = 'error' | 'success' | 'warning' | 'info';

/**
 * Badge size types
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /**
   * Badge content (usually a number)
   */
  count?: number | string;

  /**
   * Badge variant (semantic feedback color)
   * @default 'error'
   */
  variant?: BadgeVariant;

  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Show badge even if count is 0
   * @default false
   */
  showZero?: boolean;

  /**
   * Maximum count to display (shows "99+" if exceeded)
   * @default 99
   */
  maxCount?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

/**
 * Badge component using semantic feedback colors.
 *
 * @example
 * // Basic badge
 * <Badge count={5} />
 *
 * @example
 * // Different variants
 * <Badge count={3} variant="error" />
 * <Badge count={10} variant="success" />
 * <Badge count={2} variant="warning" />
 *
 * @example
 * // Different sizes
 * <Badge count={5} size="sm" />
 * <Badge count={5} size="lg" />
 *
 * @example
 * // With max count
 * <Badge count={150} maxCount={99} /> // Shows "99+"
 *
 * @example
 * // Text badge
 * <Badge count="NEW" variant="info" />
 */
export const Badge: React.FC<BadgeProps> = ({
  count = 0,
  variant = 'error',
  size = 'md',
  showZero = false,
  maxCount = 99,
  style,
}) => {
  styles.useVariants({
    variant,
    size,
  } as UnistylesVariants<typeof styles>);

  // Don't render if count is 0 and showZero is false
  if (!showZero && count === 0) {
    return null;
  }

  // Size mappings
  const sizeMap: Record<
    BadgeSize,
    { minWidth: number; height: number; fontSize: number }
  > = {
    sm: { minWidth: 14, height: 14, fontSize: 9 },
    md: { minWidth: 18, height: 18, fontSize: 11 },
    lg: { minWidth: 22, height: 22, fontSize: 13 },
  };

  // Format count
  const displayCount =
    typeof count === 'number' && count > maxCount
      ? `${maxCount}+`
      : String(count);

  const sizeStyle = sizeMap[size];

  return (
    <View
      style={[
        styles.badge,
        {
          minWidth: sizeStyle.minWidth,
          height: sizeStyle.height,
          borderRadius: sizeStyle.height / 2,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.foundation.spacing.xs,
    variants: {
      variant: {
        error: {
          backgroundColor: theme.colors.feedback.error.text,
        },
        success: {
          backgroundColor: theme.colors.feedback.success.text,
        },
        warning: {
          backgroundColor: theme.colors.feedback.warning.text,
        },
        info: {
          backgroundColor: theme.colors.feedback.info.text,
        },
      },
    },
  },
  text: {
    color: theme.colors.text.inverse,
    fontWeight: theme.foundation.typography.weight.bold,
  },
}));

export default Badge;
