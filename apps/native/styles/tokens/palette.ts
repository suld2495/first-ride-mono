/**
 * Raw Color Tokens (Primitive Layer)
 *
 * ⚠️ 내부 전용: 컴포넌트에서 직접 import 금지
 * 오직 theme 정의에서만 참조한다.
 */

export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  blue: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  red: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  green: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  yellow: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFEB3B',
    600: '#FDD835',
    700: '#FBC02D',
    800: '#F9A825',
    900: '#F57F17',
  },

  rpg: {
    strength: '#e74c3c',
    agility: '#2ecc71',
    intelligence: '#3498db',
    luck: '#f1c40f',
    vitality: '#e91e63',
    mana: '#9b59b6',
    exp: '#ffd700',
    frame: '#8b7355',
    frameDark: '#5d4e37',
  },
} as const;
