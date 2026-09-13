import { palette } from '@/theme/tokens';

import type { ThemeContract } from './theme.contract';

/**
 * 홈 화면을 제외한 모든 화면에 적용하는 "중립 표면" 레이어.
 * 직업 테마(blue/green/red)의 이름과 캐릭터·홈 전용 토큰은 그대로 두고,
 * 배경·본문 텍스트·테두리·입력 필드 토큰만 피그마의 회색 계열로 바꾼다.
 * 색상 기준: 피그마 gray/3(배경) · gray/5(카드/필드) · gray/8(테두리) · gray/10(보조 라벨) · gray/70(본문) · gray/90(제목)
 */
export const neutralSurfaceColors = {
  background: palette.theme.gray[3],
  surface: palette.theme.gray[5],
  elevated: palette.white,
  border: palette.theme.gray[8],
  label: palette.theme.gray[10],
  description: palette.theme.gray[13],
  secondary: palette.theme.gray[30],
  text: palette.theme.gray[70],
  strongText: palette.theme.gray[80],
  title: palette.theme.gray[90],
} as const;

export const withNeutralSurface = (theme: ThemeContract): ThemeContract => ({
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      ...theme.colors.background,
      base: neutralSurfaceColors.background,
      surface: neutralSurfaceColors.surface,
      elevated: neutralSurfaceColors.elevated,
      sunken: neutralSurfaceColors.surface,
      input: neutralSurfaceColors.elevated,
      media: neutralSurfaceColors.surface,
    },
    text: {
      ...theme.colors.text,
      primary: neutralSurfaceColors.text,
      secondary: neutralSurfaceColors.secondary,
      tertiary: neutralSurfaceColors.description,
      muted: neutralSurfaceColors.label,
      soft: neutralSurfaceColors.description,
      disabled: neutralSurfaceColors.label,
      gray: neutralSurfaceColors.strongText,
      title: neutralSurfaceColors.title,
      pageHeaderTitle: neutralSurfaceColors.title,
      label: neutralSurfaceColors.secondary,
      input: neutralSurfaceColors.text,
    },
    border: {
      ...theme.colors.border,
      default: neutralSurfaceColors.border,
      strong: neutralSurfaceColors.label,
      subtle: neutralSurfaceColors.surface,
      divider: neutralSurfaceColors.border,
      input: neutralSurfaceColors.border,
    },
    field: {
      ...theme.colors.field,
      label: neutralSurfaceColors.secondary,
      placeholder: neutralSurfaceColors.label,
      text: neutralSurfaceColors.text,
      border: neutralSurfaceColors.border,
      background: neutralSurfaceColors.surface,
    },
    filter: {
      status: {
        activeBackground: neutralSurfaceColors.elevated,
        activeBorder: neutralSurfaceColors.text,
        activeText: neutralSurfaceColors.text,
        inactiveBorder: neutralSurfaceColors.label,
        inactiveText: neutralSurfaceColors.label,
      },
    },
    brand: {
      ...theme.colors.brand,
      grey: neutralSurfaceColors.border,
      background: neutralSurfaceColors.background,
      backgroundGrey: neutralSurfaceColors.surface,
      text: neutralSurfaceColors.text,
      textSecondary: neutralSurfaceColors.secondary,
      input: neutralSurfaceColors.surface,
      border: neutralSurfaceColors.border,
      card: neutralSurfaceColors.surface,
    },
  },
});
