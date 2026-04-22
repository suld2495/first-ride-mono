import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';
import { baseFoundation } from '@/theme/tokens';

import PixelCard from '@/components/ui/pixel-card';
import PixelProgressBar from '@/components/ui/pixel-progress-bar';
import Typography from '@/components/ui/typography';
import { palette } from '@/theme/tokens';

interface StatHeaderProps {
  nickname: string;
  level: number;
  currentExp: number;
  expForNextLevel: number;
}

export const StatHeader: React.FC<StatHeaderProps> = ({
  nickname,
  level,
  currentExp,
  expForNextLevel,
}) => {
  return (
    <PixelCard>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={baseFoundation.iconSize.xl} color={palette.rpg.exp} />
          </View>
          <View style={styles.info}>
            <Typography variant="subtitle" glow>
              {nickname}
            </Typography>
            <View style={styles.levelRow}>
              <Ionicons name="star" size={baseFoundation.iconSize.s} color={palette.rpg.exp} />
              <Typography variant="label" color={palette.rpg.exp}>
                {' '}
                Lv. {level}
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.expContainer}>
          <View style={styles.expLabelRow}>
            <Typography variant="label">EXP</Typography>
            <Typography variant="label">
              {currentExp} / {expForNextLevel}
            </Typography>
          </View>
          <PixelProgressBar
            value={currentExp}
            maxValue={expForNextLevel}
            color={palette.rpg.exp}
            height={baseFoundation.dimension.x16}
          />
        </View>
      </View>
    </PixelCard>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: baseFoundation.spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.dimension.x12,
  },
  avatarContainer: {
    width: baseFoundation.dimension.x56,
    height: baseFoundation.dimension.x56,
    borderRadius: baseFoundation.dimension.x4,
    borderWidth: 2,
    borderColor: theme.colors.border.strong,
    backgroundColor: theme.colors.background.sunken,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: baseFoundation.spacing.xs,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expContainer: {
    gap: baseFoundation.spacing.xs,
  },
  expLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));

export default StatHeader;
