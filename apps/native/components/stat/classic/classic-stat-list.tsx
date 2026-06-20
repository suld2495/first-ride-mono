import type { UserStats } from '@repo/types';
import React from 'react';
import { View } from 'react-native';

import PixelCard from '@/components/ui/pixel-card';
import { StyleSheet } from '@/components/ui/tamagui';
import { STAT_CONFIGS } from '@/constants/STATS';
import { baseFoundation } from '@/theme/tokens';

import ClassicStatItem from './classic-stat-item';

interface ClassicStatListProps {
  stats: UserStats;
  originalStats?: UserStats;
  isEditing: boolean;
  canIncrement: boolean;
  onIncrement: (key: keyof UserStats) => void;
  onDecrement: (key: keyof UserStats) => void;
}

export const ClassicStatList: React.FC<ClassicStatListProps> = ({
  stats,
  originalStats,
  isEditing,
  canIncrement,
  onIncrement,
  onDecrement,
}) => {
  return (
    <PixelCard title="STATS">
      <View style={styles.container}>
        {STAT_CONFIGS.map((config) => (
          <ClassicStatItem
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
    </PixelCard>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: baseFoundation.spacing[0],
  },
});

export default ClassicStatList;
