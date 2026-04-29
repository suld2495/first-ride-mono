import * as NavigationBar from 'expo-navigation-bar';
import * as React from 'react';
import { Platform } from 'react-native';

import { appThemes } from '@/theme/themes';
import type { ThemeName } from '@/theme/themes';

import { useColorScheme } from './useColorScheme';

type ThemeColorName = keyof typeof appThemes.light.colors.brand &
  keyof typeof appThemes.dark.colors.brand;

export function useThemeColor(
  props: { light?: string; dark?: string; blue?: string },
  colorName: ThemeColorName,
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  return colorFromProps
    ? colorFromProps
    : appThemes[theme].colors.brand[colorName];
}

/**
 * Set the Android navigation bar color based on the color scheme.
 */
function useInitialAndroidBarSync() {
  const colorScheme = useColorScheme();

  React.useEffect(() => {
    if (Platform.OS !== 'android') return;
    setNavigationBar(colorScheme);
  }, [colorScheme]);
}

export { useColorScheme, useInitialAndroidBarSync };

function setNavigationBar(colorScheme: ThemeName) {
  const nativeScheme = colorScheme === 'light' ? 'light' : 'dark';

  return Promise.all([
    NavigationBar.setButtonStyleAsync(
      nativeScheme === 'dark' ? 'light' : 'dark',
    ),
    NavigationBar.setPositionAsync('absolute'),
    NavigationBar.setBackgroundColorAsync(
      nativeScheme === 'dark' ? '#00000030' : '#ffffff80',
    ),
  ]);
}
