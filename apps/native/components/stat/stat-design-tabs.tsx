import React from 'react';
import { Pressable, View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

export type StatDesignType = 'classic' | 'grid' | 'radar';

interface StatDesignTabsProps {
  activeTab: StatDesignType;
  onTabChange: (tab: StatDesignType) => void;
}

const TABS: { key: StatDesignType; label: string }[] = [
  { key: 'classic', label: 'Classic' },
  { key: 'grid', label: 'Grid' },
  { key: 'radar', label: 'Radar' },
];

export const StatDesignTabs: React.FC<StatDesignTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      {TABS.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <Pressable
            key={key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(key)}
          >
            <Typography
              variant="label"
              weight="semibold"
              color={
                isActive
                  ? theme.colors.text.primary
                  : theme.colors.text.secondary
              }
            >
              {label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.surface,
    borderRadius: baseFoundation.dimension.x4,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    padding: baseFoundation.spacing[1],
    marginVertical: baseFoundation.spacing[2],
  },
  tab: {
    flex: 1,
    paddingVertical: baseFoundation.spacing[2],
    alignItems: 'center',
    borderRadius: baseFoundation.dimension.x2,
  },
  activeTab: {
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
}));

export default StatDesignTabs;
