import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { createButtonStyle, type ButtonVariant, type ButtonSize } from '@/design-system';
import { useColorScheme } from '@/hooks/useColorScheme';

import ThemeText, { ThemeTextProps } from './ThemeText';

export type ButtonProps = PressableProps & {
  lightColor?: string;
  darkColor?: string;
  title?: string;
  /**
   * Button variant (통합 토큰 기반)
   * @default 'primary'
   */
  variant?: ButtonVariant | 'filled' | 'outline'; // filled = primary (legacy)
  /**
   * Button size (통합 토큰 기반)
   * @default 'medium'
   */
  size?: ButtonSize;
  fontSize?: ThemeTextProps['variant'];
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  iconGap?: number;
  loading?: boolean;
};

/**
 * 통합 Button 컴포넌트 (React Native)
 *
 * @example
 * <Button variant="primary" title="저장" />
 * <Button variant="plain" size="small" title="취소" />
 * <Button variant="danger" loading title="삭제중" />
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  title = '',
  style,
  fontSize = 'label',
  icon,
  iconGap = 4,
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  const colorScheme = useColorScheme();

  // Legacy variant 매핑
  const getMappedVariant = (): ButtonVariant => {
    if (variant === 'filled') return 'primary';
    return variant as ButtonVariant;
  };

  const mappedVariant = getMappedVariant();
  const buttonStyle = createButtonStyle(mappedVariant, size, colorScheme);

  return (
    <Pressable
      style={[buttonStyle.container, style]}
      disabled={disabled || loading}
      {...props}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: iconGap }}>
        {loading ? (
          <ActivityIndicator color={buttonStyle.text.color as string} size="small" />
        ) : (
          <>
            {icon && icon}
            {title && (
              <ThemeText
                lightColor={buttonStyle.text.color as string}
                darkColor={buttonStyle.text.color as string}
                variant={fontSize}
                style={{ marginTop: -2 }}
              >
                {title}
              </ThemeText>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

export default Button;
