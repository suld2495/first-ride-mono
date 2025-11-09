import {
  ActivityIndicator,
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
  variant?: 'filled' | 'outline' | 'plain' | 'primary' | 'danger';
  size?: 'small' | 'very-small' | 'medium' | 'large';
  fontSize?: ThemeTextProps['variant'];
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  iconGap?: number;
  loading?: boolean;
};

const Button = ({
  variant = 'filled',
  size = 'medium',
  title = '',
  style,
  fontSize = 'button',
  icon,
  iconGap = 4,
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  const colorScheme = useColorScheme();

  const getTextColor = () => {
    if (variant === 'filled' || variant === 'primary' || variant === 'danger') {
      return COLORS.white;
    }
    return COLORS[colorScheme].grey;
  };

  const getBackgroundColor = () => {
    if (variant === 'primary') return COLORS[colorScheme].primary;
    if (variant === 'danger') return COLORS[colorScheme].error;
    return undefined;
  };

  const textColor = getTextColor();
  const backgroundColor = getBackgroundColor();

  return (
    <Pressable
      style={[
        styles.container,
        styles[size],
        variant === 'filled' && styles[`light_${variant}`],
        variant === 'outline' && styles.light_outline,
        variant === 'plain' && styles.light_plain,
        backgroundColor && { backgroundColor },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      <View style={[styles.button_container, { gap: iconGap }]}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
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
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  button_container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  button_text: {
    marginTop: -2,
  },

  // Size styles
  'very-small': {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  medium: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  large: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  // Variant styles
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