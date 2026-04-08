import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import PixelText from './pixel-text';
import ThemeView from './theme-view';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  message,
}) => {
  const { theme } = useUnistyles();

  return (
    <ThemeView style={styles.container}>
      <Ionicons name={icon} size={48} color={theme.colors.text.tertiary} />
      <PixelText variant="body" style={styles.message}>
        {message}
      </PixelText>
    </ThemeView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.foundation.spacing.m,
    paddingVertical: theme.foundation.spacing.xxl,
  },
  message: {
    textAlign: 'center',
  },
}));

export default EmptyState;
