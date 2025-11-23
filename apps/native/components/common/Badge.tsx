import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { borderRadius, feedbackColors } from '@repo/design-system';

import { useColorScheme } from '@/hooks/useColorScheme';

import { Typography } from './Typography';

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
  const colorScheme = useColorScheme();

  // Don't render if count is 0 and showZero is false
  if (!showZero && count === 0) {
    return null;
  }

  // Size mappings
  const sizeMap: Record<BadgeSize, { width: number; height: number; fontSize: number }> = {
    sm: { width: 14, height: 14, fontSize: 9 },
    md: { width: 18, height: 18, fontSize: 11 },
    lg: { width: 22, height: 22, fontSize: 13 },
  };

  // Get semantic feedback color
  const backgroundColor = feedbackColors[variant].icon[colorScheme];

  // Format count
  const displayCount =
    typeof count === 'number' && count > maxCount ? `${maxCount}+` : String(count);

  const sizeStyle = sizeMap[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          minWidth: sizeStyle.width,
          height: sizeStyle.height,
          borderRadius: sizeStyle.height / 2,
        },
        style,
      ]}
    >
      <Typography
        style={{
          color: 'white',
          fontSize: sizeStyle.fontSize,
          fontWeight: 'bold',
        }}
      >
        {displayCount}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
});

export default Badge;
