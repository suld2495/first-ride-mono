/**
 * Semantic Color Tokens
 * 의미 기반 컬러 토큰 (Raw 컬러를 의미에 맞게 매핑)
 *
 * 카테고리:
 * - brand: 브랜드 컬러 (50-950 스케일 그대로 노출)
 * - action: 버튼/링크 등 액션 요소
 * - content: 텍스트 컬러
 * - surface: 배경 컬러
 * - border: 보더/구분선 컬러
 * - feedback: 피드백/상태 컬러 (success, error, warning, info)
 */

import { rawColors, type ColorScheme } from '../raw/colors';

/**
 * 1. Brand Colors (브랜드 컬러 - 50~950 전체 스케일 노출)
 */
export const brandColors = {
  50: { light: rawColors.brand[50], dark: rawColors.brand[950] },
  100: { light: rawColors.brand[100], dark: rawColors.brand[900] },
  200: { light: rawColors.brand[200], dark: rawColors.brand[800] },
  300: { light: rawColors.brand[300], dark: rawColors.brand[700] },
  400: { light: rawColors.brand[400], dark: rawColors.brand[600] },
  500: { light: rawColors.brand[500], dark: rawColors.brand[500] },
  600: { light: rawColors.brand[600], dark: rawColors.brand[400] },
  700: { light: rawColors.brand[700], dark: rawColors.brand[300] },
  800: { light: rawColors.brand[800], dark: rawColors.brand[200] },
  900: { light: rawColors.brand[900], dark: rawColors.brand[100] },
  950: { light: rawColors.brand[950], dark: rawColors.brand[50] },
} as const;

/**
 * 2. Action Colors (버튼, 링크 등 액션 요소)
 */
export const actionColors = {
  // Primary Actions (저장, 확인, 제출) - 브랜드 컬러 활용
  primary: { light: rawColors.brand[600], dark: rawColors.brand[500] },
  primaryHover: { light: rawColors.brand[700], dark: rawColors.brand[400] },
  primaryActive: { light: rawColors.brand[800], dark: rawColors.brand[300] },
  primaryDisabled: { light: rawColors.brand[300], dark: rawColors.brand[800] },

  // Secondary Actions (취소, 닫기) - 중립 gray
  secondary: { light: rawColors.gray[600], dark: rawColors.gray[500] },
  secondaryHover: { light: rawColors.gray[700], dark: rawColors.gray[400] },

  // Destructive Actions (삭제, 제거) - red
  destructive: { light: rawColors.red[600], dark: rawColors.red[500] },
  destructiveHover: { light: rawColors.red[700], dark: rawColors.red[400] },

  // Ghost Actions (투명 버튼 hover)
  ghostHover: { light: rawColors.gray[100], dark: rawColors.gray[800] },
} as const;

/**
 * 3. Content Colors (텍스트)
 */
export const contentColors = {
  // Text Hierarchy
  heading: { light: rawColors.gray[900], dark: rawColors.gray[50] },
  title: { light: rawColors.gray[800], dark: rawColors.gray[100] },
  subtitle: { light: rawColors.gray[700], dark: rawColors.gray[200] },

  // Body Text
  body: { light: rawColors.gray[700], dark: rawColors.gray[300] },
  bodySecondary: { light: rawColors.gray[600], dark: rawColors.gray[400] },
  bodyTertiary: { light: rawColors.gray[500], dark: rawColors.gray[500] },

  // Special Text
  muted: { light: rawColors.gray[500], dark: rawColors.gray[500] },
  disabled: { light: rawColors.gray[400], dark: rawColors.gray[600] },
  placeholder: { light: rawColors.gray[400], dark: rawColors.gray[600] },
  link: { light: rawColors.brand[600], dark: rawColors.brand[400] },
  linkHover: { light: rawColors.brand[700], dark: rawColors.brand[300] },
  inverse: { light: rawColors.white, dark: rawColors.gray[900] },
} as const;

/**
 * 4. Surface Colors (배경)
 */
export const surfaceColors = {
  // Surface Levels
  base: { light: rawColors.white, dark: rawColors.gray[900] },
  raised: { light: rawColors.white, dark: rawColors.gray[800] },
  sunken: { light: rawColors.gray[50], dark: rawColors.gray[950] },
  overlay: { light: rawColors.white, dark: rawColors.gray[800] },

  // Interactive Backgrounds
  hover: { light: rawColors.gray[100], dark: rawColors.gray[800] },
  active: { light: rawColors.gray[200], dark: rawColors.gray[700] },
  selected: { light: rawColors.brand[50], dark: rawColors.brand[950] },
  disabledBg: { light: rawColors.gray[100], dark: rawColors.gray[800] },
} as const;

/**
 * 5. Border Colors (경계선)
 */
export const borderColors = {
  // Border Variants
  default: { light: rawColors.gray[200], dark: rawColors.gray[700] },
  subtle: { light: rawColors.gray[100], dark: rawColors.gray[800] },
  emphasis: { light: rawColors.gray[300], dark: rawColors.gray[600] },
  strong: { light: rawColors.gray[400], dark: rawColors.gray[500] },

  // Interactive Borders
  hover: { light: rawColors.gray[300], dark: rawColors.gray[600] },
  focus: { light: rawColors.brand[600], dark: rawColors.brand[500] },
  error: { light: rawColors.red[600], dark: rawColors.red[500] },
  success: { light: rawColors.green[600], dark: rawColors.green[500] },

  // Dividers
  divider: { light: rawColors.gray[100], dark: rawColors.gray[800] },
  dividerEmphasis: { light: rawColors.gray[200], dark: rawColors.gray[700] },
} as const;

/**
 * 6. Feedback Colors (피드백/상태)
 */
export const feedbackColors = {
  // Success
  success: {
    bg: { light: rawColors.green[50], dark: rawColors.green[950] },
    border: { light: rawColors.green[200], dark: rawColors.green[800] },
    text: { light: rawColors.green[800], dark: rawColors.green[200] },
    icon: { light: rawColors.green[600], dark: rawColors.green[400] },
  },

  // Error
  error: {
    bg: { light: rawColors.red[50], dark: rawColors.red[950] },
    border: { light: rawColors.red[200], dark: rawColors.red[800] },
    text: { light: rawColors.red[800], dark: rawColors.red[200] },
    icon: { light: rawColors.red[600], dark: rawColors.red[400] },
  },

  // Warning
  warning: {
    bg: { light: rawColors.yellow[50], dark: rawColors.yellow[950] },
    border: { light: rawColors.yellow[200], dark: rawColors.yellow[800] },
    text: { light: rawColors.yellow[800], dark: rawColors.yellow[200] },
    icon: { light: rawColors.yellow[600], dark: rawColors.yellow[400] },
  },

  // Info
  info: {
    bg: { light: rawColors.blue[50], dark: rawColors.blue[950] },
    border: { light: rawColors.blue[200], dark: rawColors.blue[800] },
    text: { light: rawColors.blue[800], dark: rawColors.blue[200] },
    icon: { light: rawColors.blue[600], dark: rawColors.blue[400] },
  },
} as const;

/**
 * Semantic Colors 통합
 */
export const semanticColors = {
  brand: brandColors,
  action: actionColors,
  content: contentColors,
  surface: surfaceColors,
  border: borderColors,
  feedback: feedbackColors,
} as const;

/**
 * Helper: Semantic 컬러 가져오기
 */
export const getSemanticColor = (
  category: keyof typeof semanticColors,
  token: string,
  scheme: ColorScheme
): string => {
  const categoryColors = semanticColors[category] as any;
  const parts = token.split('.');

  let value = categoryColors;
  for (const part of parts) {
    value = value[part];
  }

  return value[scheme];
};
