import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useColorSchemeStore } from '@/store/colorScheme.store';
import { ThemeName } from '@/styles/themes';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

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
          size={24}
          style={styles.optionIcon}
          color={isSelected ? styles.selectedIcon.color : styles.optionIcon.color}
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
          size={24}
          color={styles.checkIcon.color}
        />
      )}
    </Pressable>
  );
};

const THEME_OPTIONS: { name: ThemeName; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'light', label: '라이트', icon: 'sunny-outline' },
  { name: 'dark', label: '다크', icon: 'moon-outline' },
];

const ThemeModal = () => {
  const currentTheme = useColorScheme();
  const setColorScheme = useColorSchemeStore((state) => state.setColorScheme);

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
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  header: {
    marginBottom: 24,
  },

  optionList: {
    gap: 12,
  },

  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
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
    gap: 12,
  },

  optionIcon: {
    color: theme.colors.text.secondary,
  },

  selectedIcon: {
    color: theme.colors.action.primary.default,
  },

  optionLabel: {
    fontSize: 16,
  },

  selectedLabel: {
    fontWeight: '600',
    color: theme.colors.action.primary.default,
  },

  checkIcon: {
    color: theme.colors.action.primary.default,
  },
}));
