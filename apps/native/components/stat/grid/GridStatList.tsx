import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { UserStats } from '@repo/types';

import { STAT_CONFIGS } from '@/constants/stats';

import GridStatCard from './GridStatCard';

interface GridStatListProps {
  stats: UserStats;
  originalStats?: UserStats;
  isEditing: boolean;
  canIncrement: boolean;
  onIncrement: (key: keyof UserStats) => void;
  onDecrement: (key: keyof UserStats) => void;
}

export const GridStatList: React.FC<GridStatListProps> = ({
  stats,
  originalStats,
  isEditing,
  canIncrement,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.container}>
      {STAT_CONFIGS.map((config) => (
        <GridStatCard
          key={config.key}
          config={config}
          value={stats[config.key]}
          originalValue={originalStats?.[config.key]}
          isEditing={isEditing}
          canIncrement={canIncrement}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
});

export default GridStatList;
