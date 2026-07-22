import type { QuestStatusFilter } from '@repo/types';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { commonStatusFilterColors } from '@/theme/themes/common';
import { baseFoundation } from '@/theme/tokens';

interface QuestStatusTabsProps {
  selected: QuestStatusFilter;
  onSelect: (status: QuestStatusFilter) => void;
  right?: ReactNode;
}

const TABS: { value: QuestStatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '진행중' },
];

const QuestStatusTabs = ({
  selected,
  onSelect,
  right,
}: QuestStatusTabsProps) => {
  const { theme } = useAppTheme();
  const statusColors = theme.colors.filter?.status ?? commonStatusFilterColors;

  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.tabs} transparent>
        {TABS.map((tab) => {
          const isSelected = selected === tab.value;

          return (
            <Button
              key={tab.value}
              variant="ghost"
              onPress={() => onSelect(tab.value)}
              style={({ pressed }: { pressed: boolean }) => [
                styles.tab,
                isSelected && {
                  borderColor: statusColors.activeBorder,
                  backgroundColor: statusColors.activeBackground,
                },
                !isSelected && {
                  borderColor: statusColors.inactiveBorder,
                },
                pressed && styles.tabPressed,
              ]}
            >
              <Typography
                variant="body3"
                weight="semibold"
                color={
                  isSelected
                    ? statusColors.activeText
                    : statusColors.inactiveText
                }
              >
                {tab.label}
              </Typography>
            </Button>
          );
        })}
      </ThemeView>
      {right ? (
        <ThemeView style={styles.right} transparent>
          {right}
        </ThemeView>
      ) : null}
    </ThemeView>
  );
};

export default QuestStatusTabs;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.foundation.spacing[1],
  },

  tabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: baseFoundation.dimension.x4,
  },

  tab: {
    height: baseFoundation.dimension.x32,
    paddingHorizontal: baseFoundation.dimension.x12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: baseFoundation.dimension.x99,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  tabPressed: {
    opacity: 0.7,
  },

  right: {
    marginLeft: theme.foundation.spacing[2],
  },
}));
