export {
  Button as TamaguiButton,
  Input as TamaguiInput,
  Spinner as TamaguiSpinner,
  Stack as TamaguiStack,
  Text as TamaguiText,
  XStack as TamaguiXStack,
  YStack as TamaguiYStack,
} from 'tamagui';

import {
  Dimensions,
  StyleSheet as ReactNativeStyleSheet,
  type ImageStyle,
  type RegisteredStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';

import {
  getEffectiveColorSchemeSnapshot,
  useEffectiveColorScheme,
} from '@/hooks/useEffectiveColorScheme';
import { appThemes } from '@/theme/themes';
import { createFoundation } from '@/theme/tokens';

const createAppStyleTheme = (
  themeName: keyof typeof appThemes,
  viewportWidth?: number,
) => {
  const theme = appThemes[themeName] ?? appThemes.dark;

  return {
    ...theme,
    foundation: createFoundation(theme, viewportWidth),
  };
};

const appStyleThemes = {
  light: createAppStyleTheme('light'),
  dark: createAppStyleTheme('dark'),
  blue: createAppStyleTheme('blue'),
  green: createAppStyleTheme('green'),
  red: createAppStyleTheme('red'),
} as const;

export type AppTheme = (typeof appStyleThemes)[keyof typeof appStyleThemes];
export type AppThemes = typeof appStyleThemes;
export type AppStyleVariants<T> = Partial<Record<keyof T | string, unknown>>;

type StyleFactory<T> = T | ((theme: AppTheme) => T);
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

type CreatedStyles<T> = T & {
  useVariants: (_variants?: unknown) => void;
};

const getThemeName = () => getEffectiveColorSchemeSnapshot();

const getTheme = (): AppTheme =>
  createAppStyleTheme(getThemeName(), Dimensions.get('window').width);

const evaluateStyles = <T extends Record<string, unknown>>(
  factory: StyleFactory<T>,
) => (typeof factory === 'function' ? factory(getTheme()) : factory);

export const StyleSheet = {
  create<T extends NamedStyles<T>>(factory: StyleFactory<T>) {
    return new Proxy(
      {},
      {
        get(_, prop) {
          if (prop === 'useVariants') {
            return () => undefined;
          }

          const styles = evaluateStyles(factory);
          return styles[prop as keyof T];
        },
      },
    ) as CreatedStyles<T>;
  },
  compose: ReactNativeStyleSheet.compose,
  flatten: ReactNativeStyleSheet.flatten,
  absoluteFillObject: ReactNativeStyleSheet.absoluteFillObject,
  hairlineWidth: ReactNativeStyleSheet.hairlineWidth,
};

export const useAppTheme = () => {
  const colorScheme = useEffectiveColorScheme();
  const { width } = useWindowDimensions();

  return {
    theme: createAppStyleTheme(colorScheme, width),
    rt: {
      themeName: colorScheme,
    },
  };
};

export const TamaguiRuntime = {
  setTheme: () => undefined,
};

export type RegisteredAppStyle<T> = RegisteredStyle<T>;
export type AppStyleProp<T> = StyleProp<T>;
