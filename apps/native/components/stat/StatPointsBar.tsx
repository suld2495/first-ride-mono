import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

import PixelText from '@/components/common/PixelText';
import { palette } from '@/styles/tokens/palette';

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
  const { theme } = useUnistyles();
  const remainingPoints = availablePoints - usedPoints;
  const hasPoints = availablePoints > 0;
  const hasChanges = usedPoints > 0;

  if (!hasPoints && !isEditing) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.pointsInfo}>
        <Ionicons name="flag" size={18} color={palette.rpg.exp} />
        <PixelText variant="label">
          {isEditing
            ? `Remaining: ${remainingPoints}`
            : `Available Points: ${availablePoints}`}
        </PixelText>
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
                size={16}
                color={
                  hasChanges
                    ? theme.colors.text.primary
                    : theme.colors.text.disabled
                }
              />
              <PixelText
                variant="label"
                color={
                  hasChanges
                    ? theme.colors.text.primary
                    : theme.colors.text.disabled
                }
              >
                Reset
              </PixelText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={!hasChanges}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={hasChanges ? palette.white : theme.colors.text.disabled}
              />
              <PixelText
                variant="label"
                color={hasChanges ? palette.white : theme.colors.text.disabled}
              >
                Confirm
              </PixelText>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.button, styles.editButton]}
            onPress={onEdit}
          >
            <Ionicons name="create-outline" size={16} color={palette.white} />
            <PixelText variant="label" color={palette.white}>
              Edit
            </PixelText>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.background.surface,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border.default,
    marginVertical: 8,
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
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
