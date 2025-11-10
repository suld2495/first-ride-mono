import {
  StyleProp,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { createInputStyle, type InputVariant, type InputSize } from '@/design-system';
import { useColorScheme } from '@/hooks/useColorScheme';

import ThemeView from './ThemeView';

interface ThemeTextInputProps extends Omit<TextInputProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  width?: number;
  onChangeText: (text: string) => void;
  /**
   * Input variant (통합 토큰 기반)
   * @default 'primary'
   */
  variant?: InputVariant;
  /**
   * Input size (통합 토큰 기반)
   * @default 'medium'
   */
  size?: InputSize;
  /**
   * 에러 상태
   */
  error?: boolean;
}

/**
 * 통합 TextInput 컴포넌트 (React Native)
 *
 * @example
 * <ThemeTextInput
 *   variant="primary"
 *   placeholder="입력하세요"
 *   onChangeText={setText}
 * />
 *
 * @example
 * <ThemeTextInput
 *   variant="outline"
 *   error
 *   onChangeText={setText}
 * />
 */
const ThemeTextInput = ({
  style,
  width,
  variant = 'primary',
  size = 'medium',
  error = false,
  onChangeText,
  editable = true,
  ...props
}: ThemeTextInputProps) => {
  const colorScheme = useColorScheme();
  const inputStyle = createInputStyle(variant, size, colorScheme, error);

  return (
    <ThemeView
      style={[
        inputStyle.container,
        { width: width ?? '100%' },
        { opacity: editable ? 1 : 0.5 },
        style,
      ]}
    >
      <TextInput
        {...props}
        onChangeText={onChangeText}
        style={[
          inputStyle.input,
          {
            width: '100%',
            height: '100%',
            textAlignVertical: 'top',
          },
        ]}
        placeholderTextColor={inputStyle.placeholderColor}
        editable={editable}
      />
    </ThemeView>
  );
};

export default ThemeTextInput;
