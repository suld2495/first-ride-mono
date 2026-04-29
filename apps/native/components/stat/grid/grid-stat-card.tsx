import Ionicons from '@expo/vector-icons/Ionicons';
import type { UserStats } from '@repo/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import Typography from '@/components/ui/typography';
import { type StatConfig } from '@/constants/STATS';

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
  const { theme } = useAppTheme();
  const canDecrement = originalValue !== undefined && value > originalValue;
  const hasChanged = originalValue !== undefined && value !== originalValue;

  return (
    <View style={[styles.container, { borderColor: config.color }]}>
      <View style={[styles.iconBg, { backgroundColor: `${config.color}20` }]}>
        <Ionicons name={config.icon} size={baseFoundation.dimension.x28} color={config.color} />
      </View>

      <Typography
        variant="value"
        color={hasChanged ? config.color : theme.colors.text.primary}
        glow={hasChanged}
      >
        {value}
      </Typography>

      <Typography variant="label" color={config.color}>
        {config.abbr}
      </Typography>

      {isEditing && (
        <View style={styles.controls}>
          <Pressable
            style={[styles.arrowButton, !canDecrement && styles.arrowDisabled]}
            onPress={() => onDecrement(config.key)}
            disabled={!canDecrement}
          >
            <Ionicons
              name="remove"
              size={baseFoundation.iconSize.s}
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
              size={baseFoundation.iconSize.s}
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
    borderRadius: baseFoundation.dimension.x8,
    borderWidth: 2,
    padding: baseFoundation.spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.spacing.xs,
  },
  iconBg: {
    width: baseFoundation.dimension.x44,
    height: baseFoundation.dimension.x44,
    borderRadius: baseFoundation.dimension.x22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: baseFoundation.spacing.s,
    marginTop: baseFoundation.spacing.xs,
  },
  arrowButton: {
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    borderRadius: baseFoundation.dimension.x4,
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
