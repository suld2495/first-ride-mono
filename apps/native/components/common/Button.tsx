import {
  Pressable,
  type PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';

import ThemeText, { ThemeTextProps } from './ThemeText';

export type ButtonProps = PressableProps & {
  lightColor?: string;
  darkColor?: string;
  title?: string;
  variant?: 'filled' | 'outline' | 'plain';
  fontSize?: ThemeTextProps['variant'];
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  iconGap?: number;
};

const Button = ({
  variant = 'filled',
  title = '',
  style,
  fontSize = 'button',
  icon,
  iconGap = 4,
  ...props
}: ButtonProps) => {
  const colorScheme = useColorScheme();
  const textColor =
    variant === 'filled' ? COLORS.white : COLORS[colorScheme].grey;

  return (
    <Pressable
      style={[styles.container, styles[`light_${variant}`], style]}
      {...props}
    >
      <View style={[styles.button_container, { gap: iconGap }]}>
        {icon && icon}
        {title && (
          <ThemeText
            lightColor={textColor}
            darkColor={textColor}
            variant={fontSize}
            style={styles.button_text}
          >
            {title}
          </ThemeText>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  button_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  button_text: {
    marginTop: -2,
  },

  light_filled: {
    backgroundColor: COLORS.light.button,
  },

  light_outline: {
    borderWidth: 1,
    borderColor: COLORS.light.button,
  },

  light_plain: {
    backgroundColor: 'transparent',
  },

  dark_filled: {
    backgroundColor: COLORS.dark.button,
  },

  dark_outline: {
    borderWidth: 1,
    borderColor: COLORS.dark.button,
  },

  dark_plain: {
    backgroundColor: 'transparent',
  },
});

export default Button;