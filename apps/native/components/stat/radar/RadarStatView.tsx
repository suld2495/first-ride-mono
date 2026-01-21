import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { UserStats } from '@repo/types';

import PixelCard from '@/components/common/PixelCard';

import RadarChart from './RadarChart';
import RadarStatList from './RadarStatList';

interface RadarStatViewProps {
  stats: UserStats;
  originalStats?: UserStats;
  isEditing: boolean;
  canIncrement: boolean;
  onIncrement: (key: keyof UserStats) => void;
  onDecrement: (key: keyof UserStats) => void;
}

export const RadarStatView: React.FC<RadarStatViewProps> = ({
  stats,
  originalStats,
  isEditing,
  canIncrement,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.container}>
      <PixelCard>
        <RadarChart stats={stats} size={220} />
      </PixelCard>

      <PixelCard title="STATS">
        <RadarStatList
          stats={stats}
          originalStats={originalStats}
          isEditing={isEditing}
          canIncrement={canIncrement}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      </PixelCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
});

export default RadarStatView;
