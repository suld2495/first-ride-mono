import { appThemes, type ThemeName } from '@/theme/themes';

export const getRoutineBackgroundColor = (
  themeName: ThemeName,
  evolutionCount?: number,
): string => {
  const theme = appThemes[themeName] ?? appThemes.blue;

  if (evolutionCount === 1) {
    return theme.colors.brand.routineEvolutionBackground.stage1;
  }

  if (evolutionCount === 2) {
    return theme.colors.brand.routineEvolutionBackground.stage2;
  }

  return theme.colors.brand.secondary;
};
