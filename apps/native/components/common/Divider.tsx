import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

/**
 * Divider variant types
 * - subtle: 연한 구분선
 * - default: 기본 구분선
 * - emphasis: 강조 구분선
 */
export type DividerVariant = 'subtle' | 'default' | 'emphasis';

/**
 * Divider orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends Omit<ViewProps, 'style'> {
  /**
   * Divider variant (semantic token)
   * @default 'default'
   */
  variant?: DividerVariant;

  /**
   * Divider orientation
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;

  /**
   * Thickness in pixels
   * @default 1
   */
  thickness?: number;

  /**
   * Margin/spacing around divider
   * @default 0
   */
  spacing?: number;
}

/**
 * Divider component using semantic border tokens.
 *
 * @example
 * // Horizontal divider (default)
 * <Divider />
 *
 * @example
 * // Vertical divider
 * <Divider orientation="vertical" />
 *
 * @example
 * // Different variants
 * <Divider variant="subtle" />
 * <Divider variant="emphasis" />
 *
 * @example
 * // With spacing
 * <Divider spacing={16} />
 */
export const Divider: React.FC<DividerProps> = ({
  variant = 'default',
  orientation = 'horizontal',
  thickness = 1,
  spacing = 0,
  ...props
}) => {
  styles.useVariants({
    variant,
  } as UnistylesVariants<typeof styles>);

  // 동적 스타일 (thickness와 spacing은 props로 받음)
  const dynamicStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          height: thickness,
          width: '100%',
          marginVertical: spacing,
        }
      : {
          width: thickness,
          height: '100%',
          marginHorizontal: spacing,
        };

  return <View style={[styles.base, dynamicStyle]} {...props} />;
};

const styles = StyleSheet.create((theme) => ({
  base: {
    variants: {
      variant: {
        subtle: {
          backgroundColor: theme.colors.border.subtle,
        },
        default: {
          backgroundColor: theme.colors.border.default,
        },
        emphasis: {
          backgroundColor: theme.colors.border.strong,
        },
      },
    },
  },
}));

export default Divider;
