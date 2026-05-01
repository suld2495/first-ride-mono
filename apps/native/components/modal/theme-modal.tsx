import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSetAppColorScheme } from '@/hooks/useThemePreference';
import { StyleSheet } from '@/components/ui/tamagui';
import type { ThemeName } from '@/theme/themes';

interface ThemeOptionProps {
  name: ThemeName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onSelect: (name: ThemeName) => void;
}

const ThemeOption = ({
  name,
  label,
  icon,
  isSelected,
  onSelect,
}: ThemeOptionProps) => {
  return (
    <Pressable
      onPress={() => onSelect(name)}
      style={({ pressed }) => [
        styles.optionContainer,
        isSelected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
    >
      <ThemeView style={styles.optionContent} transparent>
        <Ionicons
          name={icon}
          size={styles.optionIcon.fontSize}
          style={styles.optionIcon}
          color={
            isSelected ? styles.selectedIcon.color : styles.optionIcon.color
          }
        />
        <Typography
          style={[styles.optionLabel, isSelected && styles.selectedLabel]}
        >
          {label}
        </Typography>
      </ThemeView>
      {isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={styles.checkIcon.fontSize}
          color={styles.checkIcon.color}
        />
      )}
    </Pressable>
  );
};

const THEME_OPTIONS: {
  name: ThemeName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'light', label: '라이트', icon: 'sunny-outline' },
  { name: 'dark', label: '다크', icon: 'moon-outline' },
  { name: 'blue', label: '블루', icon: 'moon-outline' },
  { name: 'green', label: '그린', icon: 'leaf-outline' },
  { name: 'red', label: '레드', icon: 'heart-outline' },
];

const ThemeModal = () => {
  const currentTheme = useColorScheme();
  const setColorScheme = useSetAppColorScheme();

  const handleSelectTheme = (name: ThemeName) => {
    setColorScheme(name);
  };

  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.header} transparent>
        <Typography variant="body" color="secondary">
          앱의 테마를 선택하세요
        </Typography>
      </ThemeView>

      <ThemeView style={styles.optionList} transparent>
        {THEME_OPTIONS.map((option) => (
          <ThemeOption
            key={option.name}
            name={option.name}
            label={option.label}
            icon={option.icon}
            isSelected={currentTheme === option.name}
            onSelect={handleSelectTheme}
          />
        ))}
      </ThemeView>
    </ThemeView>
  );
};

export default ThemeModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.foundation.spacing.m,
    paddingTop: theme.foundation.dimension.x20,
  },

  header: {
    marginBottom: theme.foundation.spacing.l,
  },

  optionList: {
    gap: theme.foundation.dimension.x12,
  },

  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.foundation.spacing.m,
    borderRadius: theme.foundation.dimension.x12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.surface,
  },

  optionSelected: {
    borderColor: theme.colors.action.primary.default,
    backgroundColor: theme.colors.action.secondary.default,
  },

  optionPressed: {
    opacity: 0.7,
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.dimension.x12,
  },

  optionIcon: {
    fontSize: theme.foundation.iconSize.l,
    color: theme.colors.text.secondary,
  },

  selectedIcon: {
    color: theme.colors.action.secondary.label,
  },

  optionLabel: {
    fontSize: theme.foundation.typography.size.l,
    color: theme.colors.text.primary,
  },

  selectedLabel: {
    fontWeight: '600',
    color: theme.colors.action.secondary.label,
  },

  checkIcon: {
    fontSize: theme.foundation.iconSize.l,
    color: theme.colors.action.secondary.label,
  },
}));
