import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';

import ThemeView from './ThemeView';

interface ThemeTextInputProps extends Omit<TextInputProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  width?: number;
  onChangeText: (text: string) => void;
}

const ThemeTextInput = ({
  style,
  width,
  onChangeText,
  ...props
}: ThemeTextInputProps) => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <ThemeView
      style={[
        styles.container,
        styles[colorScheme],
        { width: width ?? '100%' },
        style,
      ]}
    >
      <TextInput
        {...props}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor={COLORS[colorScheme].grey}
      />
    </ThemeView>
  );
};

export default ThemeTextInput;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 5,
      height: 44,
      paddingLeft: 10,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },

    light: {
      borderColor: COLORS.light.grey,
      color: COLORS.light.text,
    },

    dark: {
      borderWidth: 0,
      backgroundColor: COLORS.dark.backgroundGrey,
    },

    input: {
      fontSize: 14,
      width: '100%',
      height: '100%',
      color: COLORS[colorScheme].text,
      textAlignVertical: 'top',
    },
  });
