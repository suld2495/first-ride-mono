import { StyleSheet } from 'react-native-unistyles';

import type { QuestStatus } from '@/store/quest.store';

import { Button } from '../common/Button';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface QuestStatusTabsProps {
  selected: QuestStatus;
  onSelect: (status: QuestStatus) => void;
}

const TABS: { value: QuestStatus; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
];

const QuestStatusTabs = ({ selected, onSelect }: QuestStatusTabsProps) => {
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
            <Typography variant="body" style={styles.tabText}>
              {tab.label}
            </Typography>
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.action.primary.default,
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: theme.foundation.radii.s,
  },

  tabSelected: {
    backgroundColor: theme.colors.action.secondary.default,
    borderColor: theme.colors.action.primary.default,
    borderWidth: 1,
  },

  tabPressed: {
    opacity: 0.7,
  },

  tabText: {
    fontWeight: '600',
  },
}));
