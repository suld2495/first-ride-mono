import React from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import PixelText from './PixelText';

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
              <PixelText variant="label">{title}</PixelText>
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
    marginVertical: 4,
  },
  borderOuter: {
    borderWidth: 3,
    borderColor: theme.colors.border.strong,
    borderRadius: 4,
    backgroundColor: theme.colors.background.surface,
  },
  borderInner: {
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 2,
    margin: 1,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.elevated,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
}));

export default PixelCard;
