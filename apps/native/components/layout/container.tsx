import { StatusBar } from 'expo-status-bar';
import React from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
  safeAreaStyle?: StyleProp<ViewStyle>;
}

const Container: React.FC<ContainerProps> = ({
  children,
  safeAreaStyle,
  style,
  noPadding = false,
  ...props
}) => {
  return (
    <SafeAreaView
      style={[styles.safeArea, safeAreaStyle]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />
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
    paddingHorizontal: baseFoundation.spacing[4],
    paddingVertical: baseFoundation.spacing[4],
    backgroundColor: theme.colors.background.base,
  },
  noPadding: {
    paddingHorizontal: baseFoundation.spacing[0],
    paddingVertical: baseFoundation.spacing[0],
  },
}));

export default Container;
