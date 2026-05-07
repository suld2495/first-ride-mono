import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

interface StatPointsBarProps {
  availablePoints: number;
  usedPoints: number;
  isEditing: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onReset: () => void;
}

export const StatPointsBar: React.FC<StatPointsBarProps> = ({
  availablePoints,
  usedPoints,
  isEditing,
  onEdit,
  onConfirm,
  onReset,
}) => {
  const { theme } = useAppTheme();
  const remainingPoints = availablePoints - usedPoints;
  const hasPoints = availablePoints > 0;
  const hasChanges = usedPoints > 0;

  if (!hasPoints && !isEditing) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.pointsInfo}>
        <Ionicons
          name="flag"
          size={baseFoundation.dimension.x18}
          color={palette.rpg.exp}
        />
        <Typography variant="label" weight="semibold">
          {isEditing
            ? `Remaining: ${remainingPoints}`
            : `Available Points: ${availablePoints}`}
        </Typography>
      </View>

      <View style={styles.actions}>
        {isEditing ? (
          <>
            <Pressable
              style={[styles.button, styles.resetButton]}
              onPress={onReset}
              disabled={!hasChanges}
            >
              <Ionicons
                name="refresh"
                size={baseFoundation.iconSize.s}
                color={
                  hasChanges
                    ? theme.colors.text.primary
                    : theme.colors.text.disabled
                }
              />
              <Typography
                variant="label"
                weight="semibold"
                color={
                  hasChanges
                    ? theme.colors.text.primary
                    : theme.colors.text.disabled
                }
              >
                Reset
              </Typography>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={!hasChanges}
            >
              <Ionicons
                name="checkmark"
                size={baseFoundation.iconSize.s}
                color={hasChanges ? palette.white : theme.colors.text.disabled}
              />
              <Typography
                variant="label"
                weight="semibold"
                color={hasChanges ? palette.white : theme.colors.text.disabled}
              >
                Confirm
              </Typography>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.button, styles.editButton]}
            onPress={onEdit}
          >
            <Ionicons
              name="create-outline"
              size={baseFoundation.iconSize.s}
              color={palette.white}
            />
            <Typography variant="label" weight="semibold" color={palette.white}>
              Edit
            </Typography>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: baseFoundation.dimension.x12,
    paddingVertical: baseFoundation.dimension.x10,
    backgroundColor: theme.colors.background.surface,
    borderRadius: baseFoundation.dimension.x4,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    marginVertical: baseFoundation.spacing[2],
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: baseFoundation.spacing[2],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[1],
    paddingHorizontal: baseFoundation.dimension.x12,
    paddingVertical: baseFoundation.dimension.x6,
    borderRadius: baseFoundation.dimension.x4,
    borderWidth: 2,
  },
  editButton: {
    backgroundColor: theme.colors.action.primary.default,
    borderColor: theme.colors.action.primary.pressed,
  },
  confirmButton: {
    backgroundColor: palette.rpg.agility,
    borderColor: '#27ae60',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border.default,
  },
}));

export default StatPointsBar;
