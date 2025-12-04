import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { Input } from './Input';

export interface PasswordInputProps {
  /** Current password value */
  value: string;
  /** Callback when text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional width override */
  width?: number;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper text (error message etc) */
  helperText?: string;
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
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { theme } = useUnistyles();

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
        style={styles.input}
        error={error}
        helperText={helperText}
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
          size={20}
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
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});
