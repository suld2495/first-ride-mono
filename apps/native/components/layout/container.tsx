import { StatusBar } from 'expo-status-bar';
import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  noPadding = false,
  ...props
}) => {
  // 라우트에 따라 바뀌는 중립 표면(홈 외 회색 배경)에 즉시 반응하도록 훅으로 배경색을 읽는다.
  const { theme } = useAppTheme();
  const backgroundStyle = { backgroundColor: theme.colors.background.base };

  return (
    <SafeAreaView
      style={[styles.safeArea, backgroundStyle]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="dark" />
      <View
        style={[
          styles.container,
          backgroundStyle,
          noPadding && styles.noPadding,
          style,
        ]}
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
