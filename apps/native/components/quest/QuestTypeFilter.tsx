import { ScrollView } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { QuestTypeFilter as QuestTypeFilterType } from '@/store/quest.store';

import { Button } from '../common/Button';
import { PixelText } from '../common/PixelText';
import ThemeView from '../common/ThemeView';

interface QuestTypeFilterProps {
  selected: QuestTypeFilterType;
  onSelect: (type: QuestTypeFilterType) => void;
}

const FILTERS: { value: QuestTypeFilterType; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'DAILY', label: '일일' },
  { value: 'WEEKLY', label: '주간' },
];

const QuestTypeFilter = ({ selected, onSelect }: QuestTypeFilterProps) => {
  const { theme } = useUnistyles();

  return (
    <ThemeView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => {
          const isSelected = selected === filter.value;

          return (
            <Button
              key={filter.value}
              variant="ghost"
              onPress={() => onSelect(filter.value)}
              style={({ pressed }: { pressed: boolean }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <PixelText
                variant="label"
                color={
                  isSelected
                    ? theme.colors.action.secondary.label
                    : theme.colors.text.secondary
                }
              >
                {filter.label}
              </PixelText>
            </Button>
          );
        })}
      </ScrollView>
    </ThemeView>
  );
};

export default QuestTypeFilter;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: theme.foundation.spacing.s,
    marginBottom: theme.foundation.spacing.s,
  },

  scrollContent: {
    paddingHorizontal: 0,
  },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: theme.foundation.spacing.m,
    borderRadius: theme.foundation.radii.l,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.base,
    marginRight: theme.foundation.spacing.s,
  },

  chipSelected: {
    borderColor: theme.colors.action.primary.default,
    backgroundColor: theme.colors.action.secondary.default,
  },

  chipPressed: {
    opacity: 0.7,
  },
}));
