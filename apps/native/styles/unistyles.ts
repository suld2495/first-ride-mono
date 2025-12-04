/**
 * Unistyles Configuration
 * 앱 최상단에서 import하여 설정 초기화
 */

import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

import { createFoundation } from './tokens/foundation';
import { baseFoundation } from './tokens/foundation.base';
import { themes } from './themes';

// ─────────────────────────────────────────────────────────────
// 테마 타입 정의
// ─────────────────────────────────────────────────────────────

// foundation이 병합된 테마 타입
type AppTheme = (typeof themes)[keyof typeof themes] & {
  foundation: ReturnType<typeof createFoundation>;
};

// 전체 앱 테마 객체 타입
type AppThemes = {
  [K in keyof typeof themes]: AppTheme;
};

// Breakpoints 타입
type AppBreakpoints = typeof baseFoundation.breakpoints;

// ─────────────────────────────────────────────────────────────
// Unistyles 타입 확장 (TypeScript용)
// ─────────────────────────────────────────────────────────────
declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// ─────────────────────────────────────────────────────────────
// Unistyles 설정
// ─────────────────────────────────────────────────────────────

// // 테마 + foundation 병합
const enhancedThemes = Object.fromEntries(
  Object.entries(themes).map(([key, theme]) => [
    key,
    { ...theme, foundation: createFoundation(theme) },
  ]),
) as AppThemes;

// Unistyles 설정
StyleSheet.configure({
  themes: enhancedThemes,
  breakpoints: baseFoundation.breakpoints,
  settings: {
    adaptiveThemes: true, // 디바이스 설정 따라 light/dark 자동 전환
  },
});

export type { UnistylesVariants };
