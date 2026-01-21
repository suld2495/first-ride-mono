import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

import PixelCard from '@/components/common/PixelCard';
import PixelProgressBar from '@/components/common/PixelProgressBar';
import PixelText from '@/components/common/PixelText';
import { palette } from '@/styles/tokens/palette';

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
            <PixelText variant="subtitle" glow>
              {nickname}
            </PixelText>
            <View style={styles.levelRow}>
              <Ionicons name="star" size={16} color={palette.rpg.exp} />
              <PixelText variant="label" color={palette.rpg.exp}>
                {' '}
                Lv. {level}
              </PixelText>
            </View>
          </View>
        </View>

        <View style={styles.expContainer}>
          <View style={styles.expLabelRow}>
            <PixelText variant="label">EXP</PixelText>
            <PixelText variant="label">
              {currentExp} / {expForNextLevel}
            </PixelText>
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
