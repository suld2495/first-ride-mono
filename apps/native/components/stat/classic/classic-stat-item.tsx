import Ionicons from '@expo/vector-icons/Ionicons';
import type { UserStats } from '@repo/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import PixelProgressBar from '@/components/ui/pixel-progress-bar';
import Typography from '@/components/ui/typography';
import { STAT_MAX_VALUE, type StatConfig } from '@/constants/STATS';

interface ClassicStatItemProps {
  config: StatConfig;
  value: number;
  originalValue?: number;
  isEditing: boolean;
  canIncrement: boolean;
  onIncrement: (key: keyof UserStats) => void;
  onDecrement: (key: keyof UserStats) => void;
}

export const ClassicStatItem: React.FC<ClassicStatItemProps> = ({
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={baseFoundation.iconSize.m} color={config.color} />
        </View>
        <View style={styles.nameContainer}>
          <Typography variant="label" color={config.color}>
            {config.abbr}
          </Typography>
          <Typography variant="label" color={theme.colors.text.secondary}>
            {config.name}
          </Typography>
        </View>
        <View style={styles.valueContainer}>
          {isEditing && (
            <Pressable
              style={[
                styles.arrowButton,
                !canDecrement && styles.arrowDisabled,
              ]}
              onPress={() => onDecrement(config.key)}
              disabled={!canDecrement}
            >
              <Ionicons
                name="chevron-back"
                size={baseFoundation.iconSize.m}
                color={
                  canDecrement
                    ? theme.colors.text.primary
                    : theme.colors.text.disabled
                }
              />
            </Pressable>
          )}
          <Typography
            variant="value"
            color={hasChanged ? config.color : theme.colors.text.primary}
          >
            {value}
          </Typography>
          {isEditing && (
            <Pressable
              style={[
                styles.arrowButton,
                !canIncrement && styles.arrowDisabled,
              ]}
              onPress={() => onIncrement(config.key)}
              disabled={!canIncrement}
            >
              <Ionicons
                name="chevron-forward"
                size={baseFoundation.iconSize.m}
                color={
                  canIncrement
                    ? theme.colors.text.primary
                    : theme.colors.text.disabled
                }
              />
            </Pressable>
          )}
        </View>
      </View>
      <PixelProgressBar
        value={value}
        maxValue={STAT_MAX_VALUE}
        color={config.color}
        height={baseFoundation.dimension.x10}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: baseFoundation.spacing.s,
    paddingHorizontal: baseFoundation.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    gap: baseFoundation.dimension.x6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing.s,
  },
  iconContainer: {
    width: baseFoundation.dimension.x32,
    height: baseFoundation.dimension.x32,
    borderRadius: baseFoundation.dimension.x4,
    backgroundColor: theme.colors.background.sunken,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing.s,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing.xs,
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

export default ClassicStatItem;
