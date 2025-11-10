import { Text as RNText, type TextProps } from 'react-native';
import { createTextStyle, type TypographyVariant } from '@/design-system';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemeTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  /**
   * Typography variant (통합 토큰 기반)
   * @default 'body'
   */
  variant?:
    | TypographyVariant
    | 'default' // legacy 지원
    | 'title' // legacy 지원
    | 'subtitle' // legacy 지원
    | 'button' // legacy 지원
    | 'medium'; // legacy 지원
};

/**
 * 통합 Typography 컴포넌트 (React Native)
 *
 * @example
 * // Semantic variant 사용 (권장)
 * <ThemeText variant="title">제목</ThemeText>
 * <ThemeText variant="body">본문</ThemeText>
 * <ThemeText variant="caption">작은 텍스트</ThemeText>
 *
 * @example
 * // Legacy variant (자동 매핑)
 * <ThemeText variant="title">제목</ThemeText>
 * <ThemeText variant="subtitle">부제목</ThemeText>
 */
const ThemeText = ({
  variant = 'body',
  lightColor,
  darkColor,
  style,
  ...props
}: ThemeTextProps) => {
  const colorScheme = useColorScheme();
  const defaultColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Legacy variant를 새로운 variant로 매핑
  const getMappedVariant = (): TypographyVariant => {
    const legacyMap: Record<string, TypographyVariant> = {
      default: 'body',
      button: 'label',
      medium: 'body',
    };

    return (legacyMap[variant] as TypographyVariant) || (variant as TypographyVariant);
  };

  const mappedVariant = getMappedVariant();
  const textStyle = createTextStyle(mappedVariant, colorScheme);

  return (
    <RNText
      style={[
        textStyle,
        // lightColor/darkColor prop이 있으면 우선 적용
        lightColor || darkColor ? { color: defaultColor } : null,
        style,
      ]}
      {...props}
    />
  );
};

export default ThemeText;
