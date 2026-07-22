import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { Input } from './input';

export interface PasswordInputProps {
  /** Accessible label passed to the native text input */
  accessibilityLabel?: string;
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
  /** Toggle icon color */
  iconColor?: string;
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
  accessibilityLabel,
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
  iconColor,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { theme } = useAppTheme();
  const toggleIconColor = iconColor ?? theme.colors.text.secondary;

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const icon =
    Platform.OS === 'web' ? (
      <Svg
        width={baseFoundation.iconSize.m}
        height={baseFoundation.iconSize.m}
        viewBox="0 0 24 24"
        fill="none"
      >
        <Path
          d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
          stroke={toggleIconColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          stroke={toggleIconColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showPassword && (
          <Path
            d="M4 20 20 4"
            stroke={toggleIconColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
      </Svg>
    ) : (
      <Ionicons
        name={showPassword ? 'eye-off' : 'eye'}
        size={baseFoundation.iconSize.m}
        color={toggleIconColor}
      />
    );

  return (
    <View style={[styles.container, width ? { width } : undefined]}>
      <Input
        accessibilityLabel={accessibilityLabel}
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
        {icon}
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
    minHeight: baseFoundation.dimension.x44,
  },

  input: {
    flex: 1,
    minHeight: baseFoundation.dimension.x44,
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
