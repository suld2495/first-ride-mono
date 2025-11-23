import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { actionColors } from '@repo/design-system';

import { useColorScheme } from '@/hooks/useColorScheme';

export interface CheckboxProps {
  /** Checkbox size in pixels (default: 20) */
  size?: number;
  /** Optional text label */
  text?: string;
  /** Fill color - uses semantic token by default */
  fillColor?: string;
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
const Checkbox = ({ size = 20, text, fillColor, onPress }: CheckboxProps) => {
  const colorScheme = useColorScheme();
  const defaultFillColor = actionColors.primary[colorScheme];

  return (
    <BouncyCheckbox
      size={size}
      text={text}
      fillColor={fillColor || defaultFillColor}
      onPress={onPress}
    />
  );
};

export default Checkbox;
