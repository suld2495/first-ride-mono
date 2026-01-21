import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { UserStats } from '@repo/types';

import PixelCard from '@/components/common/PixelCard';
import { STAT_CONFIGS } from '@/constants/stats';

import ClassicStatItem from './ClassicStatItem';

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
    gap: 0,
  },
});

export default ClassicStatList;
