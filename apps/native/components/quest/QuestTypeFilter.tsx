import { ScrollView, StyleSheet } from 'react-native';

import type { QuestTypeFilter as QuestTypeFilterType } from '@/store/quest.store';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText'
import ThemeView from '../common/ThemeView';;

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
              variant="plain"
              onPress={() => onSelect(filter.value)}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <ThemeText
                variant="caption"
                lightColor={isSelected ? '#fbbf24' : '#90a1b9'}
                darkColor={isSelected ? '#fbbf24' : '#90a1b9'}
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {filter.label}
              </ThemeText>
            </Button>
          );
        })}
      </ScrollView>
    </ThemeView>
  );
};

export default QuestTypeFilter;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: '#0891b2',
    paddingVertical: 8,
  },

  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0891b2',
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
  },

  chipSelected: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },

  chipPressed: {
    opacity: 0.7,
  },

  chipText: {
    fontSize: 13,
  },

  chipTextSelected: {
    fontWeight: 'bold',
  },
});
