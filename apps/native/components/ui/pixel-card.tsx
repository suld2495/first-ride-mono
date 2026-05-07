import React from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

export interface PixelCardProps extends ViewProps {
  title?: string;
  children: React.ReactNode;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  title,
  children,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <View style={styles.borderOuter}>
        <View style={styles.borderInner}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    marginVertical: baseFoundation.spacing[2],
    borderRadius: theme.foundation.radii.l,
    backgroundColor: theme.colors.background.surface,
    shadowColor: theme.colors.border.default,
    shadowOffset: { width: baseFoundation.dimension.x0, height: baseFoundation.dimension.x4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  borderOuter: {
    borderWidth: 0,
    borderRadius: theme.foundation.radii.l,
    overflow: 'hidden',
  },
  borderInner: {
    borderWidth: 0,
    margin: baseFoundation.spacing[0],
  },
  header: {
    paddingHorizontal: baseFoundation.dimension.x20,
    paddingVertical: baseFoundation.spacing[4],
    // borderBottomWidth: 1, // Optional: remove for cleaner look
    // borderBottomColor: theme.colors.border.divider,
    backgroundColor: theme.colors.background.surface,
  },
  title: {
    fontSize: theme.foundation.typography.size.l,
    fontWeight: theme.foundation.typography.weight.bold,
    color: theme.colors.text.primary,
  },
  content: {
    paddingVertical: baseFoundation.spacing[4],
    paddingHorizontal: baseFoundation.dimension.x20,
  },
}));

export default PixelCard;
