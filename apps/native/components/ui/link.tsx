import type { LinkProps as ExpoLinkProps } from 'expo-router';
import { Link as RNLink } from 'expo-router';

import { Button, type ButtonProps } from './button';

export type LinkProps = ExpoLinkProps &
  Omit<ButtonProps, 'onPress' | 'onLongPress' | 'onPressIn' | 'onPressOut'> & {
    /**
     * Button title text (optional)
     * @deprecated Use children instead for consistency with Button
     */
    title?: string;
  };

/**
 * Link component that combines expo-router navigation with Button styling.
 * Inherits all Button variants and styling from the design system.
 *
 * @remarks
 * Uses semantic tokens through the Button component.
 * Supports all Button variants: primary, secondary, ghost, outline, danger.
 *
 * @example
 * // Primary link (default)
 * <Link href="/home" title="Go Home" />
 *
 * @example
 * // Secondary variant link
 * <Link href="/settings" title="Settings" variant="secondary" />
 *
 * @example
 * // Link with only icon (no title)
 * <Link
 *   href="/back"
 *   variant="ghost"
 *   leftIcon={<Icon name="arrow-left" />}
 * />
 *
 * @example
 * // Link with children (recommended)
 * <Link href="/profile" variant="outline">
 *   Go to Profile
 * </Link>
 */
const Link = ({
  title,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  size,
  variant,
  backgroundColor,
  textColor,
  leftIcon,
  rightIcon,
  loading,
  fullWidth,
  style,
  textStyle,
  contentStyle,
  children,
  ...linkProps
}: LinkProps) => {
  return (
    <RNLink {...linkProps} asChild>
      <Button
        title={title}
        size={size}
        variant={variant}
        backgroundColor={backgroundColor}
        textColor={textColor}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        loading={loading}
        fullWidth={fullWidth}
        style={style}
        textStyle={textStyle}
        contentStyle={contentStyle}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        disabled={disabled}
      >
        {children}
      </Button>
    </RNLink>
  );
};

export default Link;
