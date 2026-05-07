import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import Typography from './typography';
import ThemeView from './theme-view';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  message,
}) => {
  const { theme } = useAppTheme();

  return (
    <ThemeView style={styles.container}>
      <Ionicons name={icon} size={baseFoundation.iconSize.xxl} color={theme.colors.text.tertiary} />
      <Typography variant="body" style={styles.message}>
        {message}
      </Typography>
    </ThemeView>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[12],
  },
  message: {
    textAlign: 'center',
  },
}));

export default EmptyState;
