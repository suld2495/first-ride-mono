import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { QuestStatusFilter } from '@/store/quest.store';

import { Button } from '../common/Button';
import { PixelText } from '../common/PixelText';
import ThemeView from '../common/ThemeView';

interface QuestStatusTabsProps {
  selected: QuestStatusFilter;
  onSelect: (status: QuestStatusFilter) => void;
}

const TABS: { value: QuestStatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '진행중' },
  { value: 'EXPIRED', label: '만료' },
  { value: 'UPCOMING', label: '예정' },
];

const QuestStatusTabs = ({ selected, onSelect }: QuestStatusTabsProps) => {
  const { theme } = useUnistyles();

  return (
    <ThemeView style={styles.container}>
      {TABS.map((tab) => {
        const isSelected = selected === tab.value;

        return (
          <Button
            key={tab.value}
            variant="ghost"
            onPress={() => onSelect(tab.value)}
            style={({ pressed }: { pressed: boolean }) => [
              styles.tab,
              isSelected && styles.tabSelected,
              pressed && styles.tabPressed,
            ]}
          >
            <PixelText
              variant="label"
              color={
                isSelected ? theme.colors.action.secondary.label : undefined
              }
            >
              {tab.label}
            </PixelText>
          </Button>
        );
      })}
    </ThemeView>
  );
};

export default QuestStatusTabs;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.foundation.spacing.s,
    // paddingHorizontal removed to fix double padding
  },

  tab: {
    flex: 1,
    paddingVertical: theme.foundation.spacing.s,
    paddingHorizontal: theme.foundation.spacing.m,
    alignItems: 'center',
    borderRadius: theme.foundation.radii.m,
  },

  tabSelected: {
    backgroundColor: theme.colors.action.secondary.default,
  },

  tabPressed: {
    opacity: 0.7,
  },
}));
