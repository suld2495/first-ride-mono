import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';

import ThemeTextInput from './ThemeTextInput';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  width?: number;
  autoFocus?: boolean;
}

const PasswordInput = ({
  value,
  onChangeText,
  placeholder = '비밀번호를 입력해주세요.',
  width,
  autoFocus = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const colorScheme = useColorScheme();

  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <ThemeTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        width={width}
        autoFocus={autoFocus}
        secureTextEntry={!showPassword}
        style={styles.input}
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
          color={COLORS[colorScheme].grey}
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
    right: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});
