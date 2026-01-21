import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import PixelText from '@/components/common/PixelText';

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
            <PixelText
              variant="label"
              color={
                isActive
                  ? theme.colors.text.primary
                  : theme.colors.text.secondary
              }
            >
              {label}
            </PixelText>
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
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    padding: 4,
    marginVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 2,
  },
  activeTab: {
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
}));

export default StatDesignTabs;
