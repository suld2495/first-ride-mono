import { View, type ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

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
  const { theme } = useUnistyles();

  const backgroundStyle =
    transparent || variant === undefined
      ? null
      : {
          backgroundColor: theme.colors.background[variant],
        };

  return <View style={[styles.container, backgroundStyle, style]} {...props} />;
};

const styles = StyleSheet.create(() => ({
  container: {
    flexShrink: 0,
  },
}));

export default ThemeView;
