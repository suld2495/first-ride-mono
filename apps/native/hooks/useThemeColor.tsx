import * as React from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

import { COLORS } from '@/theme/colors';

import { useColorScheme } from './useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof COLORS.light & keyof typeof COLORS.dark,
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return COLORS[theme][colorName];
  }
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

function setNavigationBar(colorScheme: 'light' | 'dark') {
  return Promise.all([
    NavigationBar.setButtonStyleAsync(
      colorScheme === 'dark' ? 'light' : 'dark',
    ),
    NavigationBar.setPositionAsync('absolute'),
    NavigationBar.setBackgroundColorAsync(
      colorScheme === 'dark' ? '#00000030' : '#ffffff80',
    ),
  ]);
}
