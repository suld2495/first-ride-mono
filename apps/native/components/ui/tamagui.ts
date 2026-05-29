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
  StyleSheet as ReactNativeStyleSheet,
  type ImageStyle,
  type RegisteredStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  getEffectiveColorSchemeSnapshot,
  useEffectiveColorScheme,
} from '@/hooks/useEffectiveColorScheme';
import { appThemes } from '@/theme/themes';
import { createFoundation } from '@/theme/tokens';

const appStyleThemes = {
  light: {
    ...appThemes.light,
    foundation: createFoundation(appThemes.light),
  },
  dark: {
    ...appThemes.dark,
    foundation: createFoundation(appThemes.dark),
  },
  blue: {
    ...appThemes.blue,
    foundation: createFoundation(appThemes.blue),
  },
  green: {
    ...appThemes.green,
    foundation: createFoundation(appThemes.green),
  },
  red: {
    ...appThemes.red,
    foundation: createFoundation(appThemes.red),
  },
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
  appStyleThemes[getThemeName()] ?? appStyleThemes.dark;

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

  return {
    theme: appStyleThemes[colorScheme] ?? appStyleThemes.dark,
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
