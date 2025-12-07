/**
 * Foundation Factory
 * theme 기반 foundation 생성
 *
 * 스킨마다 UI 밀도(density), radius 스타일, 타이포 스케일을 변경할 수 있도록 한다.
 */

import type { ThemeContract } from '../themes/theme.contract';

import { baseFoundation } from './foundation.base';

export const createFoundation = (theme: ThemeContract) => {
  // UI 밀도에 따른 spacing 스케일
  const densityScale =
    theme.density === 'compact'
      ? 0.85
      : theme.density === 'spacious'
        ? 1.15
        : 1;

  const typographyScale = theme.typography?.scale ?? 1;

  const spacing = Object.fromEntries(
    Object.entries(baseFoundation.spacing).map(([k, v]) => [
      k,
      (v as number) * densityScale,
    ]),
  ) as typeof baseFoundation.spacing;

  type RadiiType = {
    none: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    round: number;
  };

  const radii: RadiiType = (() => {
    if (theme.radiusStyle === 'sharp') {
      return {
        ...baseFoundation.radii,
        s: 0,
        m: 0,
        l: 0,
      };
    }

    if (theme.radiusStyle === 'pill') {
      return {
        ...baseFoundation.radii,
        s: 9999,
        m: 9999,
        l: 9999,
      };
    }

    // 기본 rounded
    return { ...baseFoundation.radii };
  })();

  const typography = {
    ...baseFoundation.typography,
    size: Object.fromEntries(
      Object.entries(baseFoundation.typography.size).map(([k, v]) => [
        k,
        (v as number) * typographyScale,
      ]),
    ) as typeof baseFoundation.typography.size,
    // 스킨별 폰트 패밀리
    fontFamily: theme.typography?.fontFamily ?? {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
  };

  // 스킨 불변 토큰들
  const { shadow, motion, zIndex, breakpoints, opacity, iconSize, responsive } =
    baseFoundation;

  return {
    spacing,
    radii,
    typography,
    shadow,
    motion,
    zIndex,
    breakpoints,
    opacity,
    iconSize,
    responsive,
  } as const;
};

// spacing 헬퍼
export const spacing = (multiplier: number) =>
  baseFoundation.spacing.m * multiplier;
