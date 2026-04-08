import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { type UnistylesVariants } from '@/styles/unistyles';

/**
 * Surface variant types
 * - base: 전체 화면 배경
 * - surface: 카드, 리스트 아이템 배경
 * - elevated: 모달, 드롭다운 배경
 * - sunken: 입력창 내부
 */
export type SurfaceVariant = 'base' | 'surface' | 'elevated' | 'sunken';

export type ThemedViewProps = ViewProps & {
  /**
   * Set to true to make background transparent
   */
  transparent?: boolean;
  /**
   * Surface variant (semantic token)
   * @default 'base'
   */
  variant?: SurfaceVariant;
};

/**
 * ThemeView - A View component that automatically adapts to light/dark theme.
 * Uses Unistyles for automatic theme switching.
 *
 * @example
 * // Default base surface
 * <ThemeView>
 *   <Text>Content</Text>
 * </ThemeView>
 *
 * @example
 * // Surface variants
 * <ThemeView variant="base">Base background</ThemeView>
 * <ThemeView variant="surface">Card surface</ThemeView>
 * <ThemeView variant="elevated">Modal surface</ThemeView>
 * <ThemeView variant="sunken">Input background</ThemeView>
 *
 * @example
 * // Transparent background
 * <ThemeView transparent>
 *   <Text>Content</Text>
 * </ThemeView>
 */
const ThemeView = ({
  style,
  transparent = false,
  variant = 'base',
  ...props
}: ThemedViewProps) => {
  styles.useVariants({
    variant: transparent ? undefined : variant,
  } as UnistylesVariants<typeof styles>);

  return <View style={[styles.container, style]} {...props} />;
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
        elevated: {
          backgroundColor: theme.colors.background.elevated,
        },
        sunken: {
          backgroundColor: theme.colors.background.sunken,
        },
      },
    },
  },
}));

export default ThemeView;
