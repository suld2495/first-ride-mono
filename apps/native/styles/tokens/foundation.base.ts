/**
 * Foundation Base Tokens
 * 스킨 공통 base 토큰
 *
 * 스킨이 바뀌어도 기본 스케일은 유지되지만,
 * 스킨에 따라 scale/override가 가능하다.
 */

import type { ResponsiveValue } from './responsive';

export const baseFoundation = {
  // ─────────────────────────────────────────────────────────────
  // Spacing
  // ─────────────────────────────────────────────────────────────
  spacing: {
    none: 0,
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  // ─────────────────────────────────────────────────────────────
  // Border Radius
  // ─────────────────────────────────────────────────────────────
  radii: {
    none: 0,
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 9999,
  },

  // ─────────────────────────────────────────────────────────────
  // Typography
  // ─────────────────────────────────────────────────────────────
  typography: {
    size: {
      xs: 10,
      s: 12,
      m: 14,
      l: 16,
      xl: 20,
      xxl: 24,
      title: 32,
    },
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Shadow
  // ─────────────────────────────────────────────────────────────
  shadow: {
    s: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    m: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    l: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Motion / Animation
  // ─────────────────────────────────────────────────────────────
  motion: {
    duration: {
      instant: 100,
      fast: 150,
      normal: 250,
      slow: 400,
      slower: 600,
    },
    easing: {
      linear: [0, 0, 1, 1] as const,
      easeIn: [0.4, 0, 1, 1] as const,
      easeOut: [0, 0, 0.2, 1] as const,
      easeInOut: [0.4, 0, 0.2, 1] as const,
    },
  },

  // ─────────────────────────────────────────────────────────────
  // Z-Index (레이어 순서)
  // ─────────────────────────────────────────────────────────────
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modalBackdrop: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800,
  },

  // ─────────────────────────────────────────────────────────────
  // Breakpoints (반응형)
  // ─────────────────────────────────────────────────────────────
  breakpoints: {
    xs: 0, // 작은 폰
    sm: 480, // 폰
    md: 768, // 태블릿
    lg: 1024, // 큰 태블릿
    xl: 1280, // 데스크톱
  },

  // ─────────────────────────────────────────────────────────────
  // Opacity
  // ─────────────────────────────────────────────────────────────
  opacity: {
    transparent: 0,
    disabled: 0.4,
    subtle: 0.6,
    medium: 0.8,
    solid: 1,
  },

  // ─────────────────────────────────────────────────────────────
  // Icon Size
  // ─────────────────────────────────────────────────────────────
  iconSize: {
    xs: 12,
    s: 16,
    m: 20,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  // ─────────────────────────────────────────────────────────────
  // Responsive Values (breakpoint별 값이 다른 토큰)
  // - xs는 필수, 값이 바뀌는 breakpoint만 추가 정의
  // - 모바일 퍼스트: 정의되지 않은 breakpoint는 이전 값 상속
  // ─────────────────────────────────────────────────────────────
  responsive: {
    // Layout
    containerPadding: { xs: 16, md: 24, xl: 32 } as ResponsiveValue<number>,
    sectionGap: { xs: 24, md: 40, lg: 56 } as ResponsiveValue<number>,
    gridGutter: { xs: 12, md: 20 } as ResponsiveValue<number>,
    maxContentWidth: {
      xs: -1,
      md: 720,
      lg: 960,
      xl: 1200,
    } as ResponsiveValue<number>, // -1 = 100%

    // Typography
    pageTitle: { xs: 24, md: 32, lg: 40 } as ResponsiveValue<number>,
    sectionTitle: { xs: 18, md: 22 } as ResponsiveValue<number>,
  },
} as const;
