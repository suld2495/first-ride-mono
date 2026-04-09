import type { QuestTypeFilter as QuestTypeFilterType } from '@repo/types';
import { useCallback } from 'react';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

import { Button } from '@/components/ui/button';
import { FlashList, type ListRenderItem } from '@/components/ui/flash-list';
import { PixelText } from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';

interface QuestTypeFilterProps {
  selected: QuestTypeFilterType;
  onSelect: (type: QuestTypeFilterType) => void;
}

const FILTERS: { value: QuestTypeFilterType; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'DAILY', label: '일일' },
  { value: 'WEEKLY', label: '주간' },
];

const FILTER_ITEM_WIDTH = 96;
const getFilterItemLayout = (_: typeof FILTERS | null, index: number) => ({
  length: FILTER_ITEM_WIDTH,
  offset: FILTER_ITEM_WIDTH * index,
  index,
});

const QuestTypeFilter = ({ selected, onSelect }: QuestTypeFilterProps) => {
  const { theme } = useUnistyles();
  const renderFilterItem = useCallback<
    ListRenderItem<(typeof FILTERS)[number]>
  >(
    ({ item }) => {
      const isSelected = selected === item.value;

      return (
        <Button
          variant="ghost"
          onPress={() => onSelect(item.value)}
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
            {item.label}
          </PixelText>
        </Button>
      );
    },
    [
      onSelect,
      selected,
      theme.colors.action.secondary.label,
      theme.colors.text.secondary,
    ],
  );

  return (
    <ThemeView style={styles.container}>
      <FlashList
        data={FILTERS}
        horizontal
        keyExtractor={(item) => item.value}
        renderItem={renderFilterItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        estimatedItemSize={FILTER_ITEM_WIDTH}
        getItemLayout={getFilterItemLayout}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
      />
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
