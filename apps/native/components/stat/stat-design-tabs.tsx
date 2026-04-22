import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';
import { baseFoundation } from '@/theme/tokens';

import Typography from '@/components/ui/typography';

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
  const { theme } = useUnistyles();

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
    padding: baseFoundation.spacing.xs,
    marginVertical: baseFoundation.spacing.s,
  },
  tab: {
    flex: 1,
    paddingVertical: baseFoundation.spacing.s,
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
