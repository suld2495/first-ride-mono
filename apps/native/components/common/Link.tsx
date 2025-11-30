import { Link as RNLink, LinkProps as ExpoLinkProps } from 'expo-router';

import { Button, type ButtonProps } from './Button';

export type LinkProps = ExpoLinkProps &
  Omit<
    ButtonProps,
    'onPress' | 'disabled' | 'onLongPress' | 'onPressIn' | 'onPressOut'
  > & {
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
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  ...props
}: LinkProps) => {
  return (
    <RNLink {...props} asChild>
      <Button
        title={title}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
      />
    </RNLink>
  );
};

export default Link;
