import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';

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
            <Ionicons name="person" size={32} color={palette.rpg.exp} />
          </View>
          <View style={styles.info}>
            <Typography variant="subtitle" glow>
              {nickname}
            </Typography>
            <View style={styles.levelRow}>
              <Ionicons name="star" size={16} color={palette.rpg.exp} />
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
            height={16}
          />
        </View>
      </View>
    </PixelCard>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border.strong,
    backgroundColor: theme.colors.background.sunken,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expContainer: {
    gap: 4,
  },
  expLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));

export default StatHeader;
