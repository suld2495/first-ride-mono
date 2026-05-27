import type { TextStyle } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation, palette } from '@/theme/tokens';

export type CheckboxSize = 'xs' | 'md' | 'lg';

const CHECKBOX_SIZE_MAP: Record<CheckboxSize, number> = {
  xs: 14,
  md: 18,
  lg: 24,
};

const DEFAULT_BORDER_RADIUS = 5;
const DEFAULT_BORDER_COLOR = palette.theme.gray[5];
const DEFAULT_BACKGROUND_COLOR = palette.white;
const DEFAULT_CHECK_COLOR = palette.theme.gray[5];

const CHECKBOX_LABEL_STYLE_MAP: Record<
  CheckboxSize,
  { fontSize: number; fontWeight: TextStyle['fontWeight']; lineHeight: number }
> = {
  xs: {
    fontSize: baseFoundation.typography.size.body3,
    fontWeight: baseFoundation.typography.weight.semibold,
    lineHeight: CHECKBOX_SIZE_MAP.xs,
  },
  md: {
    fontSize: baseFoundation.typography.size.body2,
    fontWeight: baseFoundation.typography.weight.semibold,
    lineHeight: CHECKBOX_SIZE_MAP.md,
  },
  lg: {
    fontSize: baseFoundation.typography.size.body1,
    fontWeight: baseFoundation.typography.weight.semibold,
    lineHeight: CHECKBOX_SIZE_MAP.lg,
  },
};

const CheckboxCheckIcon = () => (
  <Svg
    width={baseFoundation.dimension.x11}
    height={baseFoundation.dimension.x10}
    viewBox="0 0 11 10"
    fill="none"
  >
    <Path
      d="M1 5.9695L2.2045 7.261C2.869 7.9735 3.20125 8.329 3.57325 8.4415C3.90025 8.53975 4.24825 8.5135 4.5595 8.3665C4.91425 8.1985 5.1985 7.79575 5.7685 6.9895L10 1"
      stroke={DEFAULT_CHECK_COLOR}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface CheckboxProps {
  /** Checkbox size token (default: md) */
  size?: CheckboxSize;
  /** Checkbox corner radius in pixels */
  borderRadius?: number;
  /** Optional text label */
  text?: string;
  /** Fill color - uses semantic token by default */
  fillColor?: string;
  /** Controlled checked state */
  isChecked?: boolean;
  /** Whether checked labels should use BouncyCheckbox strike-through */
  strikeThroughOnChecked?: boolean;
  /** Callback when checkbox is pressed */
  onPress: (checked: boolean) => void;
}

/**
 * Checkbox component using semantic tokens.
 * Uses theme-aware colors by default.
 *
 * @example
 * <Checkbox onPress={(checked) => console.log(checked)} />
 */
const Checkbox = ({
  size = 'md',
  borderRadius,
  text,
  fillColor,
  isChecked,
  strikeThroughOnChecked = false,
  onPress,
}: CheckboxProps) => {
  const { theme } = useAppTheme();
  const defaultFillColor = theme.colors.action.primary.default;
  const defaultLabelColor = theme.colors.text.gray;
  const resolvedBorderRadius = borderRadius ?? DEFAULT_BORDER_RADIUS;
  const iconStyle = { borderRadius: resolvedBorderRadius };
  const innerIconStyle = {
    borderColor: DEFAULT_BORDER_COLOR,
    borderRadius: resolvedBorderRadius,
  };
  const textStyle = {
    color: defaultLabelColor,
    ...CHECKBOX_LABEL_STYLE_MAP[size],
    ...(strikeThroughOnChecked ? {} : { textDecorationLine: 'none' as const }),
  };
  const textContainerStyle = {
    justifyContent: 'center' as const,
    marginLeft: 7,
  };

  return (
    <BouncyCheckbox
      size={CHECKBOX_SIZE_MAP[size]}
      text={text}
      isChecked={isChecked}
      fillColor={fillColor || defaultFillColor}
      unFillColor={DEFAULT_BACKGROUND_COLOR}
      iconComponent={<CheckboxCheckIcon />}
      iconStyle={iconStyle}
      innerIconStyle={innerIconStyle}
      textContainerStyle={textContainerStyle}
      textStyle={textStyle}
      onPress={onPress}
    />
  );
};

export default Checkbox;
