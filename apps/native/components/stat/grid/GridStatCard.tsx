import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { UserStats } from '@repo/types';

import PixelText from '@/components/common/PixelText';
import { type StatConfig } from '@/constants/stats';

interface GridStatCardProps {
  config: StatConfig;
  value: number;
  originalValue?: number;
  isEditing: boolean;
  canIncrement: boolean;
  onIncrement: (key: keyof UserStats) => void;
  onDecrement: (key: keyof UserStats) => void;
}

export const GridStatCard: React.FC<GridStatCardProps> = ({
  config,
  value,
  originalValue,
  isEditing,
  canIncrement,
  onIncrement,
  onDecrement,
}) => {
  const { theme } = useUnistyles();
  const canDecrement = originalValue !== undefined && value > originalValue;
  const hasChanged = originalValue !== undefined && value !== originalValue;

  return (
    <View style={[styles.container, { borderColor: config.color }]}>
      <View style={[styles.iconBg, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={28} color={config.color} />
      </View>

      <PixelText
        variant="value"
        color={hasChanged ? config.color : theme.colors.text.primary}
        glow={hasChanged}
      >
        {value}
      </PixelText>

      <PixelText variant="label" color={config.color}>
        {config.abbr}
      </PixelText>

      {isEditing && (
        <View style={styles.controls}>
          <Pressable
            style={[styles.arrowButton, !canDecrement && styles.arrowDisabled]}
            onPress={() => onDecrement(config.key)}
            disabled={!canDecrement}
          >
            <Ionicons
              name="remove"
              size={16}
              color={
                canDecrement
                  ? theme.colors.text.primary
                  : theme.colors.text.disabled
              }
            />
          </Pressable>
          <Pressable
            style={[styles.arrowButton, !canIncrement && styles.arrowDisabled]}
            onPress={() => onIncrement(config.key)}
            disabled={!canIncrement}
          >
            <Ionicons
              name="add"
              size={16}
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
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    minWidth: '30%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background.surface,
    borderRadius: 8,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  arrowButton: {
    width: 28,
    height: 28,
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

export default GridStatCard;
