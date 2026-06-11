import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { Input } from './input';

export interface PasswordInputProps {
  /** Current password value */
  value: string;
  /** Callback when text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional width override */
  width?: ViewStyle['width'];
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper text (error message etc) */
  helperText?: string;
  /** Custom style for input container */
  style?: StyleProp<ViewStyle>;
  /** Custom style for text input */
  inputStyle?: StyleProp<TextStyle>;
  /** Placeholder text color */
  placeholderTextColor?: string;
}

/**
 * PasswordInput component with show/hide toggle.
 * Uses semantic tokens for consistent theming.
 *
 * @example
 * <PasswordInput
 *   value={password}
 *   onChangeText={setPassword}
 *   placeholder="비밀번호를 입력해주세요."
 * />
 */

const PasswordInput = ({
  value,
  onChangeText,
  placeholder = '비밀번호를 입력해주세요.',
  width,
  autoFocus = false,
  error,
  helperText,
  style,
  inputStyle,
  placeholderTextColor,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { theme } = useAppTheme();

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <View style={[styles.container, width ? { width } : undefined]}>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoFocus={autoFocus}
        secureTextEntry={!showPassword}
        fullWidth
        style={[styles.input, style]}
        inputStyle={inputStyle}
        error={error}
        helperText={helperText}
        placeholderTextColor={placeholderTextColor}
      />
      <Pressable
        onPress={togglePasswordVisibility}
        style={styles.iconContainer}
        accessibilityLabel="비밀번호 표시 토글"
        accessibilityHint={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
        accessibilityRole="button"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={showPassword ? 'eye-off' : 'eye'}
          size={baseFoundation.iconSize.m}
          color={theme.colors.text.secondary}
        />
      </Pressable>
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
  },

  iconContainer: {
    position: 'absolute',
    right: 4,
    top: 0,
    height: baseFoundation.dimension.x44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: baseFoundation.spacing[2],
  },
});
