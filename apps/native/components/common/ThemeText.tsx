import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemeTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?:
    | 'default'
    | 'title'
    | 'subtitle'
    | 'button'
    | 'body'
    | 'medium'
    | 'caption';
};

const ThemeText = ({
  variant = 'default',
  lightColor,
  darkColor,
  style,
  ...props
}: ThemeTextProps) => {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <RNText style={[styles[variant], { color }, style]} {...props} />;
};

export default ThemeText;

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'semibold',
  },
  button: {
    fontSize: 15,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
  },
  medium: {
    fontSize: 14,
  },
  caption: {
    fontSize: 12,
  },
});
