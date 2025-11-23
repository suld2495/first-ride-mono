import { View, type ViewProps } from 'react-native';
import { surfaceColors } from '@repo/design-system';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * Surface variant types
 */
export type SurfaceVariant = 'base' | 'raised' | 'sunken' | 'overlay';

export type ThemedViewProps = ViewProps & {
  /** Custom light theme background color (overrides semantic token) */
  lightColor?: string;
  /** Custom dark theme background color (overrides semantic token) */
  darkColor?: string;
  /** Set to true to make background transparent */
  transparent?: boolean;
  /**
   * Surface variant (semantic token)
   * - base: Base surface color
   * - raised: Raised surface (cards, modals)
   * - sunken: Sunken surface (wells, insets)
   * - overlay: Overlay background
   */
  variant?: SurfaceVariant;
};

/**
 * ThemeView - A View component that automatically adapts to light/dark theme.
 * Uses semantic tokens by default, with optional color overrides.
 *
 * @remarks
 * This component uses the 'background' semantic token by default.
 * Only provide lightColor/darkColor when you need to override the theme.
 *
 * @example
 * // Uses semantic token (recommended)
 * <ThemeView>
 *   <Text>Content</Text>
 * </ThemeView>
 *
 * @example
 * // Surface variants (semantic tokens)
 * <ThemeView variant="base">Base surface</ThemeView>
 * <ThemeView variant="raised">Card surface</ThemeView>
 * <ThemeView variant="sunken">Inset surface</ThemeView>
 * <ThemeView variant="overlay">Modal overlay</ThemeView>
 *
 * @example
 * // Custom colors (only when needed)
 * <ThemeView lightColor="#ffffff" darkColor="#000000">
 *   <Text>Content</Text>
 * </ThemeView>
 *
 * @example
 * // Transparent background (no background color)
 * <ThemeView transparent>
 *   <Text>Content</Text>
 * </ThemeView>
 */
const ThemeView = ({
  style,
  lightColor,
  darkColor,
  transparent = false,
  variant,
  ...props
}: ThemedViewProps) => {
  const colorScheme = useColorScheme();
  const themeBackgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background',
  );

  // Priority: transparent > variant > custom colors > default
  const getBackgroundColor = (): string | undefined => {
    if (transparent) return undefined;

    if (variant) {
      return surfaceColors[variant][colorScheme];
    }

    return themeBackgroundColor;
  };

  const backgroundColor = getBackgroundColor();

  return <View style={[{ backgroundColor }, style]} {...props} />;
};

export default ThemeView;
