import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

interface ScreenLayoutProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  style,
  noPadding = false,
  ...props
}) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View
        style={[styles.container, noPadding && styles.noPadding, style]}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.base,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.background.base,
  },
  noPadding: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
}));

export default ScreenLayout;
