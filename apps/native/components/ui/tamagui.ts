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
  getNeutralSurfaceSnapshot,
  useEffectiveColorScheme,
  useNeutralSurface,
} from '@/hooks/useEffectiveColorScheme';
import { appThemes, neutralAppThemes } from '@/theme/themes';
import { createFoundation } from '@/theme/tokens';

const createAppStyleTheme = (
  themeName: keyof typeof appThemes,
  viewportWidth?: number,
  neutralSurface = false,
) => {
  const themeSet = neutralSurface ? neutralAppThemes : appThemes;
  const theme = themeSet[themeName] ?? themeSet.dark;

  return {
    ...theme,
    foundation: createFoundation(theme, viewportWidth),
  };
};

export type AppTheme = ReturnType<typeof createAppStyleTheme>;
export type AppThemes = Record<keyof typeof appThemes, AppTheme>;
export type AppStyleVariants<T> = Partial<Record<keyof T | string, unknown>>;

type StyleFactory<T> = T | ((theme: AppTheme) => T);
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

type CreatedStyles<T> = T & {
  useVariants: (_variants?: unknown) => void;
};

const getThemeName = () => getEffectiveColorSchemeSnapshot();

const getTheme = (): AppTheme =>
  createAppStyleTheme(
    getThemeName(),
    Dimensions.get('window').width,
    getNeutralSurfaceSnapshot(),
  );

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
  // 스토어 구독은 값이 바뀔 때 다시 렌더링하기 위한 것이고, 실제 값은 렌더 스냅샷을 우선한다.
  useNeutralSurface();
  const { width } = useWindowDimensions();

  return {
    theme: createAppStyleTheme(colorScheme, width, getNeutralSurfaceSnapshot()),
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
