import { Pressable, StyleSheet, View } from 'react-native';

import type { QuestStatus } from '@/store/quest.store';

import ThemeText from '../common/ThemeText';

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
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isSelected = selected === tab.value;

        return (
          <Pressable
            key={tab.value}
            onPress={() => onSelect(tab.value)}
            style={({ pressed }) => [
              styles.tab,
              isSelected && styles.tabSelected,
              pressed && styles.tabPressed,
            ]}
          >
            <ThemeText
              variant="default"
              lightColor={isSelected ? '#1ddeff' : '#90a1b9'}
              darkColor={isSelected ? '#1ddeff' : '#90a1b9'}
              style={styles.tabText}
            >
              {tab.label}
            </ThemeText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default QuestStatusTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: '#0891b2',
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 4,
  },

  tabSelected: {
    backgroundColor: 'rgba(29, 222, 255, 0.1)',
    borderColor: '#1ddeff',
    borderWidth: 1,
  },

  tabPressed: {
    opacity: 0.7,
  },

  tabText: {
    fontWeight: '600',
  },
});
