import {
  StyleSheet as ReactNativeStyleSheet,
  type ImageStyle,
  type RegisteredStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useColorSchemeStore } from '@/store/color-scheme.store';
import { darkTheme } from '@/styles/themes/dark';
import { lightTheme } from '@/styles/themes/light';
import { createFoundation } from '@/styles/tokens/foundation';

const appThemes = {
  light: {
    ...lightTheme,
    foundation: createFoundation(lightTheme),
  },
  dark: {
    ...darkTheme,
    foundation: createFoundation(darkTheme),
  },
} as const;

export type AppTheme = (typeof appThemes)[keyof typeof appThemes];
export type UnistylesThemes = typeof appThemes;
export type UnistylesVariants<T> = Partial<Record<keyof T | string, unknown>>;

type StyleFactory<T> = T | ((theme: AppTheme) => T);
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

type CreatedStyles<T> = T & {
  useVariants: (_variants?: unknown) => void;
};

const getThemeName = () => useColorSchemeStore.getState().colorScheme;

const getTheme = (): AppTheme => appThemes[getThemeName()] ?? appThemes.dark;

const evaluateStyles = <T extends Record<string, unknown>>(
  factory: StyleFactory<T>,
) => (typeof factory === 'function' ? factory(getTheme()) : factory);

export const StyleSheet = {
  create<T extends NamedStyles<T> | NamedStyles<any>>(factory: StyleFactory<T>) {
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

export const useUnistyles = () => {
  const colorScheme = useColorSchemeStore((state) => state.colorScheme);

  return {
    theme: appThemes[colorScheme] ?? appThemes.dark,
    rt: {
      themeName: colorScheme,
    },
  };
};

export const UnistylesRuntime = {
  setTheme: () => undefined,
};

export type RegisteredAppStyle<T> = RegisteredStyle<T>;
export type AppStyleProp<T> = StyleProp<T>;
