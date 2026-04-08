import React from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
    marginVertical: 8,
    borderRadius: theme.foundation.radii.l,
    backgroundColor: theme.colors.background.surface,
    shadowColor: theme.colors.border.default,
    shadowOffset: { width: 0, height: 4 },
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
    margin: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
}));

export default PixelCard;
