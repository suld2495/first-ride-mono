export type ThemeDensity = 'compact' | 'comfortable' | 'spacious';
export type ThemeRadiusStyle = 'sharp' | 'rounded' | 'pill';

export type ThemeContract = {
  name: string;
  density?: ThemeDensity;
  radiusStyle?: ThemeRadiusStyle;
  typography?: {
    fontFamily?: {
      regular: string;
      medium?: string;
      bold?: string;
    };
    scale?: number;
  };
  colors: {
    background: {
      base: string;
      surface: string;
      elevated: string;
      sunken: string;
      overlay: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
      link: string;
    };
    action: {
      primary: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
      secondary: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
      ghost: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
    };
    feedback: {
      success: { bg: string; text: string; border: string };
      error: { bg: string; text: string; border: string };
      warning: { bg: string; text: string; border: string };
      info: { bg: string; text: string; border: string };
    };
    border: {
      default: string;
      strong: string;
      subtle: string;
      focus: string;
      divider: string;
    };
    brand: {
      grey: string;
      background: string;
      backgroundGrey: string;
      primary: string;
      text: string;
      textSecondary: string;
      icon: string;
      button: string;
      buttonLight: string;
      subButton: string;
      checkbox: string;
      input: string;
      error: string;
      success: string;
      warning: string;
      info: string;
      border: string;
      boxShadow: string;
      foreground: string;
      root: string;
      card: string;
    };
  };
};
