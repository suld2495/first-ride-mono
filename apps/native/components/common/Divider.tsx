import { StyleSheet, View, type ViewProps } from 'react-native';
import { borderColors } from '@repo/design-system';

import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Divider variant types
 */
export type DividerVariant = 'subtle' | 'default' | 'emphasis';

/**
 * Divider orientation
 */
export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends Omit<ViewProps, 'style'> {
  /**
   * Divider variant (semantic token)
   * - subtle: Light divider
   * - default: Default divider
   * - emphasis: Emphasized divider
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
  const colorScheme = useColorScheme();

  // Get semantic border color
  const borderColorMap: Record<DividerVariant, string> = {
    subtle: borderColors.subtle[colorScheme],
    default: borderColors.divider[colorScheme],
    emphasis: borderColors.dividerEmphasis[colorScheme],
  };

  const backgroundColor = borderColorMap[variant];

  const style =
    orientation === 'horizontal'
      ? {
          height: thickness,
          width: '100%',
          backgroundColor,
          marginVertical: spacing,
        }
      : {
          width: thickness,
          height: '100%',
          backgroundColor,
          marginHorizontal: spacing,
        };

  return <View style={style} {...props} />;
};

export default Divider;
