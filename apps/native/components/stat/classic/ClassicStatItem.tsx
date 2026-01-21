import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { UserStats } from '@repo/types';

import PixelProgressBar from '@/components/common/PixelProgressBar';
import PixelText from '@/components/common/PixelText';
import { STAT_MAX_VALUE, type StatConfig } from '@/constants/stats';

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
  const { theme } = useUnistyles();
  const canDecrement = originalValue !== undefined && value > originalValue;
  const hasChanged = originalValue !== undefined && value !== originalValue;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.nameContainer}>
          <PixelText variant="label" color={config.color}>
            {config.abbr}
          </PixelText>
          <PixelText variant="label" color={theme.colors.text.secondary}>
            {config.name}
          </PixelText>
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
                size={20}
                color={
                  canDecrement
                    ? theme.colors.text.primary
                    : theme.colors.text.disabled
                }
              />
            </Pressable>
          )}
          <PixelText
            variant="value"
            color={hasChanged ? config.color : theme.colors.text.primary}
          >
            {value}
          </PixelText>
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
                size={20}
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
        height={10}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: theme.colors.background.sunken,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

export default ClassicStatItem;
