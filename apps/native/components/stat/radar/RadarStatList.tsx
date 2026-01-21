import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { UserStats } from '@repo/types';

import PixelText from '@/components/common/PixelText';
import { STAT_CONFIGS } from '@/constants/stats';

interface RadarStatListProps {
  stats: UserStats;
  originalStats?: UserStats;
  isEditing: boolean;
  canIncrement: boolean;
  onIncrement: (key: keyof UserStats) => void;
  onDecrement: (key: keyof UserStats) => void;
}

export const RadarStatList: React.FC<RadarStatListProps> = ({
  stats,
  originalStats,
  isEditing,
  canIncrement,
  onIncrement,
  onDecrement,
}) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      {STAT_CONFIGS.map((config) => {
        const value = stats[config.key];
        const originalValue = originalStats?.[config.key];
        const canDecrement =
          originalValue !== undefined && value > originalValue;
        const hasChanged =
          originalValue !== undefined && value !== originalValue;

        return (
          <View key={config.key} style={styles.row}>
            <Ionicons name={config.icon} size={16} color={config.color} />
            <PixelText variant="label" color={config.color} style={styles.abbr}>
              {config.abbr}
            </PixelText>
            <PixelText
              variant="label"
              color={hasChanged ? config.color : theme.colors.text.primary}
              style={styles.value}
            >
              {value}
            </PixelText>
            {isEditing && (
              <View style={styles.controls}>
                <Pressable
                  style={[
                    styles.arrowButton,
                    !canDecrement && styles.arrowDisabled,
                  ]}
                  onPress={() => onDecrement(config.key)}
                  disabled={!canDecrement}
                >
                  <Ionicons
                    name="remove"
                    size={14}
                    color={
                      canDecrement
                        ? theme.colors.text.primary
                        : theme.colors.text.disabled
                    }
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.arrowButton,
                    !canIncrement && styles.arrowDisabled,
                  ]}
                  onPress={() => onIncrement(config.key)}
                  disabled={!canIncrement}
                >
                  <Ionicons
                    name="add"
                    size={14}
                    color={
                      canIncrement
                        ? theme.colors.text.primary
                        : theme.colors.text.disabled
                    }
                  />
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.surface,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    gap: 3,
  },
  abbr: {
    width: 32,
  },
  value: {
    width: 24,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 4,
  },
  arrowButton: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: {
    opacity: 0.4,
  },
}));

export default RadarStatList;
