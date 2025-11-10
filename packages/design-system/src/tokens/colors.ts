/**
 * 통합 색상 토큰
 * 웹과 React Native 모두에서 사용 가능한 플랫폼 독립적 색상 정의
 */

export const colors = {
  // 기본 색상
  white: '#ffffff',
  black: '#000000',

  // Primary 색상 (브랜드 컬러)
  primary: {
    light: '#1e293b',
    lightHover: '#141b27',
    lightBold: '#b7c7e2',
    dark: '#435d88',
    darkHover: '#597bb8',
    darkBold: '#2e3f5d',
    darkBoldHover: '#5676b1',
  },

  // 텍스트 색상
  text: {
    primary: {
      light: '#111111',
      dark: '#ffffff',
    },
    secondary: {
      light: '#5c5c5c',
      lightHover: '#3c3b3b',
      dark: '#ebe6e7',
      darkHover: '#c0bdbd',
    },
    muted: {
      light: '#9ca3af', // gray-400
      dark: '#6b7280',  // gray-500
    },
  },

  // Border 색상
  border: {
    light: '#e5e7eb', // gray-200
    lightFocus: '#6b7280', // gray-500
    dark: '#4b5563',  // gray-600
    darkFocus: '#9ca3af', // gray-400
  },

  // Background 색상
  background: {
    light: '#ffffff',
    lightGray: '#f9fafb', // gray-50
    dark: '#1e293b',
    darkGray: '#0f172a',
  },

  // 상태 색상
  status: {
    error: {
      light: '#ff6467',
      dark: '#ef4444', // red-500
    },
    success: {
      light: '#10b981', // green-500
      dark: '#059669', // green-600
    },
    warning: {
      light: '#f59e0b', // amber-500
      dark: '#d97706', // amber-600
    },
    info: {
      light: '#3b82f6', // blue-500
      dark: '#2563eb', // blue-600
    },
  },

  // Quest 특화 색상
  quest: {
    border: '#005f78',
    background: '#005f78',
    title: '#00d6ff',
    primary: '#1ddeff',
    error: '#ff6467',
  },

  // Reward 특화 색상
  reward: {
    border: '#b07a4f',
    background: '#8c3e1066',
    primary: '#ffb900',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

/**
 * 색상 헬퍼 함수
 */
export const getColor = (
  colorPath: string,
  scheme: ColorScheme
): string => {
  const paths = colorPath.split('.');
  let value: any = colors;

  for (const path of paths) {
    value = value[path];
    if (!value) return colors.black;
  }

  // light/dark가 있는 경우 scheme에 따라 반환
  if (typeof value === 'object' && value[scheme]) {
    return value[scheme];
  }

  return value as string;
};
