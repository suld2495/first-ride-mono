import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { QuestTypeFilter as QuestTypeFilterType } from '@/store/quest.store';

import { Button } from '../common/Button';
import PixelText from '../common/PixelText';
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
              <PixelText variant="label">
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
    backgroundColor: theme.colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.action.primary.default,
    paddingVertical: theme.foundation.spacing.s,
  },

  scrollContent: {
    paddingHorizontal: theme.foundation.spacing.m,
    gap: theme.foundation.spacing.s,
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: theme.foundation.spacing.m,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.action.primary.default,
    backgroundColor: theme.colors.action.secondary.default,
  },

  chipSelected: {
    borderColor: theme.colors.feedback.warning.text,
    backgroundColor: theme.colors.feedback.warning.bg,
  },

  chipPressed: {
    opacity: 0.7,
  },
}));
