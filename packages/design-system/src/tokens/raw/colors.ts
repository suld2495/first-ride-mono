/**
 * Raw Color Tokens
 * Tailwind CSS 표준 컬러 팔레트 (50-950 스케일)
 *
 * 정의 기준:
 * - gray: 중립 컬러 (텍스트, 보더, 배경 등)
 * - brand: 프로젝트 메인 컬러 (현재 blue 계열 - 변경 가능)
 * - red: Error, Destructive actions
 * - green: Success
 * - yellow: Warning
 * - blue: Info (brand와 분리 필요 시)
 */

export const rawColors = {
  // 중립 컬러 (필수)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // 브랜드 컬러 (프로젝트 메인 - 현재는 blue 계열)
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // 피드백 컬러: Error
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // 피드백 컬러: Success
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // 피드백 컬러: Warning
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006',
  },

  // 피드백 컬러: Info
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // 흑백
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorScheme = 'light' | 'dark';
export type RawColorKey = keyof typeof rawColors;
export type RawColorShade = keyof typeof rawColors.gray;
