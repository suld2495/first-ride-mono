import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { getThemeNameFromUserJob } from '@/theme/job-theme';
import type { ThemeName } from '@/theme/themes';

type FixedThemeName = Extract<ThemeName, 'blue' | 'green' | 'red'>;

const THEME_LABELS: Record<FixedThemeName, string> = {
  blue: '블루',
  green: '그린',
  red: '레드',
};

const THEME_ICONS: Record<FixedThemeName, keyof typeof Ionicons.glyphMap> = {
  blue: 'shield-outline',
  green: 'leaf-outline',
  red: 'sparkles-outline',
};

const getFixedThemeName = (themeName: string): FixedThemeName => {
  if (themeName === 'green' || themeName === 'red') {
    return themeName;
  }

  return 'blue';
};

const ThemeModal = () => {
  const user = useAuthUser();
  const { theme } = useAppTheme();
  const fixedThemeName =
    getThemeNameFromUserJob(user) ?? getFixedThemeName(theme.name);
  const themeLabel = THEME_LABELS[fixedThemeName];

  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.summary} transparent>
        <View style={styles.iconBadge}>
          <Ionicons
            name={THEME_ICONS[fixedThemeName]}
            size={styles.icon.fontSize}
            color={styles.icon.color}
          />
        </View>
        <ThemeView style={styles.textGroup} transparent>
          <Typography variant="title" weight="bold" style={styles.title}>
            {themeLabel}
          </Typography>
        </ThemeView>
      </ThemeView>
    </ThemeView>
  );
};

export default ThemeModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.foundation.spacing[4],
    paddingTop: theme.foundation.spacing[5],
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[4],
    padding: theme.foundation.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.foundation.radii.s,
    backgroundColor: theme.colors.background.surface,
  },
  iconBadge: {
    width: theme.foundation.dimension.x48,
    height: theme.foundation.dimension.x48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.foundation.radii.round,
    backgroundColor: theme.colors.brand.primary,
  },
  icon: {
    fontSize: theme.foundation.iconSize.l,
    color: theme.colors.brand.text,
  },
  textGroup: {
    flex: 1,
    gap: theme.foundation.spacing[1],
  },
  title: {
    color: theme.colors.text.primary,
  },
}));
